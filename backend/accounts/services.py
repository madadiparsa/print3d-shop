
import logging

from django.conf import settings
from django.utils import timezone

from .models import OTPCode, User

logger = logging.getLogger(__name__)


# =============================================================
#  OTP Generation & Delivery
# =============================================================

def send_otp(phone: str) -> OTPCode:
    """
    Generate a new OTP code for the given phone number and
    deliver it via the configured method.

    - Marks all previous unused codes for this phone as used
      so only one valid code exists at a time.
    - In demo/dev mode (OTP_MOCK_MODE=True): prints to console.
    - In production (OTP_MOCK_MODE=False): sends via SMS gateway.

    Returns the created OTPCode instance.
    """

    # Invalidate all previous unused codes for this phone
    OTPCode.objects.filter(phone=phone, is_used=False).update(is_used=True)

    # Generate a new code
    code_length = getattr(settings, "OTP_CODE_LENGTH", 6)
    code = OTPCode.generate_code(length=code_length)

    # Save to database
    otp = OTPCode.objects.create(phone=phone, code=code)

    # Deliver the code
    mock_mode = getattr(settings, "OTP_MOCK_MODE", True)

    if mock_mode:
        _deliver_mock(phone, code)
    else:
        _deliver_sms(phone, code)

    return otp


def _deliver_mock(phone: str, code: str) -> None:
    """
    Demo mode delivery — prints the OTP to the console and logs it.
    No SMS is sent. The developer reads the code from the terminal.
    """
    border = "=" * 50
    message = (
        f"\n{border}\n"
        f"  📱 MOCK OTP — کد تایید (دمو)\n"
        f"  شماره : {phone}\n"
        f"  کد    : {code}\n"
        f"{border}\n"
    )
    print(message)
    logger.info("MOCK OTP | phone=%s | code=%s", phone, code)


def _deliver_sms(phone: str, code: str) -> None:
    """
    Production SMS delivery.
    Plug in your SMS provider SDK here.

    Supported providers (Iran):
      - Kavenegar  : pip install kavenegar
      - Farazsms   : REST API
      - Melipayamak: REST API

    Example with Kavenegar:
    -------------------------
    from kavenegar import KavenegarAPI, APIException, HTTPException
    api_key = settings.SMS_API_KEY
    try:
        api = KavenegarAPI(api_key)
        params = {
            "receptor": phone,
            "token": code,
            "template": "your-template-name",
        }
        api.verify_lookup(params)
    except (APIException, HTTPException) as e:
        logger.error("SMS delivery failed: %s", e)
        raise
    """
    logger.warning(
        "SMS delivery called but no provider is configured. "
        "phone=%s — implement _deliver_sms() in services.py",
        phone,
    )


# =============================================================
#  OTP Verification
# =============================================================

def verify_otp(phone: str, code: str) -> tuple[bool, str]:
    """
    Verify a submitted OTP code against the database.

    Returns a tuple of (success: bool, message: str).

    Checks in order:
      1. Code exists for this phone
      2. Code has not been used already
      3. Code has not expired
      4. Code matches exactly
    """

    expiry_minutes = getattr(settings, "OTP_EXPIRY_MINUTES", 10)

    # Find the most recent unused code for this phone
    otp = (
        OTPCode.objects.filter(phone=phone, is_used=False)
        .order_by("-created_at")
        .first()
    )

    if otp is None:
        return False, "کد تایید یافت نشد. لطفاً دوباره درخواست کنید."

    if otp.is_expired(expiry_minutes=expiry_minutes):
        otp.is_used = True
        otp.save(update_fields=["is_used"])
        return False, "کد تایید منقضی شده است. لطفاً دوباره درخواست کنید."

    if otp.code != code:
        return False, "کد تایید اشتباه است."

    # Mark code as used so it cannot be reused
    otp.is_used = True
    otp.save(update_fields=["is_used"])

    return True, "کد تایید صحیح است."


# =============================================================
#  User Resolution
# =============================================================

def get_or_create_user(phone: str) -> tuple[User, bool]:
    """
    Return the existing user for this phone number,
    or create a new one if this is their first login.

    Returns a tuple of (user: User, created: bool).
    New users are created with no password (OTP-only auth).
    """
    user, created = User.objects.get_or_create(
        phone=phone,
        defaults={
            "is_active": True,
        },
    )

    if created:
        user.set_unusable_password()
        user.save(update_fields=["password"])
        logger.info("New user registered via OTP | phone=%s", phone)
    else:
        logger.info("Existing user logged in via OTP | phone=%s", phone)

    return user, created