import styles from "./Login.module.css";
import de from "@/constants/de.json";
import {
  ClipboardEvent,
  ChangeEvent,
  KeyboardEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useAppDispatch } from "@/store/hooks";
import { setIsLoading } from "@/store/reducer/isLoading";
import {
  handleLoginInput,
  LoginAttemptResult,
  appendPinCharacter,
  removeLastPinCharacter,
  resolveActivePinSlotIndex,
} from "@/components/features/home/Login/Login.logic";

export default function Login({}: LoginProps) {
  const dispatch = useAppDispatch();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [loginResult, setLoginResult] = useState<LoginAttemptResult>({
    status: "incomplete",
  });

  const applyPinInput = async (nextInput: string): Promise<void> => {
    const normalizedInput = nextInput.slice(0, 4);
    setPinInput(normalizedInput);

    if (normalizedInput.length < 4) {
      setLoginResult({ status: "incomplete" });
      return;
    }

    dispatch(setIsLoading(true));
    try {
      const result = await handleLoginInput({ input: normalizedInput, dispatch });
      setLoginResult(result);
    } finally {
      dispatch(setIsLoading(false));
    }
  };

  const focusPasswordInput = () => {
    if (!inputRef.current) {
      return;
    }

    try {
      inputRef.current.focus({ preventScroll: true });
    } catch {
      inputRef.current.focus();
    }
  };

  useEffect(() => {
    focusPasswordInput();
  }, []);

  const filledDots = useMemo(
    () => Array.from({ length: 4 }, (_, index) => index < pinInput.length),
    [pinInput.length],
  );
  const activeSlotIndex = resolveActivePinSlotIndex(pinInput);

  const onInputChangeHandler = async (e: ChangeEvent<HTMLInputElement>) => {
    await applyPinInput(e.target.value);
  };

  const onInputKeyDownHandler = async (
    event: KeyboardEvent<HTMLInputElement>,
  ) => {
    if (event.key === "Backspace") {
      event.preventDefault();
      await applyPinInput(removeLastPinCharacter(pinInput));
      return;
    }

    if (
      event.ctrlKey ||
      event.metaKey ||
      event.altKey ||
      event.key.length !== 1
    ) {
      return;
    }

    event.preventDefault();
    await applyPinInput(appendPinCharacter(pinInput, event.key));
  };

  const onPasteHandler = async (event: ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    const pastedText = event.clipboardData.getData("text");
    await applyPinInput(pastedText);
  };

  const infoMessage =
    loginResult.status === "rejected"
      ? de.messages.loginRejected
      : loginResult.status === "unavailable"
        ? de.messages.loginUnavailable
        : undefined;

  return (
    <section className={styles.mainContainer}>
      <form
        className={styles.loginCard}
        onSubmit={(event) => {
          event.preventDefault();
        }}
      >
        <h2 className={styles.title}>{de.messages.loginTitle}</h2>
        <p className={styles.subtitle}>{de.messages.loginSubtitle}</p>

        <div className={styles.pinRow}>
          <button
            type={"button"}
            className={styles.pinSlots}
            onTouchStart={() => focusPasswordInput()}
            onClick={() => focusPasswordInput()}
            aria-label={de.messages.loginSlotsAriaLabel}
          >
            {filledDots.map((isFilled, index) => {
              const value = pinInput[index];
              const slotValue = isFilled
                ? isPasswordVisible
                  ? value
                  : "\u2022"
                : "\u2022";
              return (
                <span
                  key={`pin-slot-${index}`}
                  className={`${styles.pinSlot} ${
                    index === activeSlotIndex ? styles.pinSlotActive : ""
                  }`}
                >
                  <span
                    className={`${styles.pinGlyph} ${
                      isFilled ? styles.pinGlyphFilled : styles.pinGlyphEmpty
                    }`}
                  >
                    {slotValue}
                  </span>
                </span>
              );
            })}
          </button>

          <button
            type={"button"}
            className={styles.visibilityButton}
            aria-pressed={isPasswordVisible}
            aria-label={
              isPasswordVisible
                ? de.messages.hidePassword
                : de.messages.showPassword
            }
            onPointerDown={(event) => {
              event.preventDefault();
            }}
            onClick={() => {
              setIsPasswordVisible(!isPasswordVisible);
              focusPasswordInput();
            }}
          >
            <span className={styles.visibilityButtonLabel}>
              {de.messages.showPin}
            </span>
            <span
              className={`${styles.visibilitySlider} ${
                isPasswordVisible ? styles.visibilitySliderActive : ""
              }`}
              aria-hidden={true}
            >
              <span className={styles.visibilitySliderThumb} />
            </span>
          </button>
        </div>

        <div className={styles.inputWrapper}>
          <input
            ref={inputRef}
            onChange={onInputChangeHandler}
            onKeyDown={onInputKeyDownHandler}
            onPaste={onPasteHandler}
            suppressHydrationWarning
            value={pinInput}
            type={isPasswordVisible ? "text" : "password"}
            className={styles.input}
            placeholder={de.inputLabels.userID}
            name={"password"}
            maxLength={4}
            autoComplete={"current-password"}
            autoCapitalize={"off"}
            autoCorrect={"off"}
            enterKeyHint={"done"}
            spellCheck={false}
          />
          <input
            className={styles.passwordManagerHint}
            type={"text"}
            name={"username"}
            autoComplete={"username"}
            suppressHydrationWarning
            tabIndex={-1}
            aria-hidden={true}
            defaultValue={de.head.title}
            readOnly
          />
        </div>

        {infoMessage ? (
          <p
            className={`${styles.message} ${
              loginResult.status === "rejected"
                ? styles.messageError
                : styles.messageInfo
            }`}
          >
            {infoMessage}
          </p>
        ) : null}
      </form>
    </section>
  );
}

export type LoginProps = {};
