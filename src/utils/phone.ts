export const sanitizeVietnamPhoneInput = (value: string) => {
    const digits = value.replace(/\D/g, '');

    if (digits.startsWith('84')) {
        return `0${digits.slice(2, 11)}`;
    }

    return digits.slice(0, 10);
};

export const toVietnamE164 = (value?: string | null) => {
    if (!value) {
        return null;
    }

    const digits = value.replace(/\D/g, '');
    const nationalNumber = digits.startsWith('84')
        ? digits.slice(2)
        : digits.startsWith('0')
          ? digits.slice(1)
          : digits;

    if (nationalNumber.length !== 9) {
        return null;
    }

    return `+84${nationalNumber}`;
};
