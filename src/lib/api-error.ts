type ApiErrorDetailItem = {
    msg?: unknown;
};

type ApiErrorLike = {
    message?: unknown;
    response?: {
        status?: unknown;
        data?: {
            detail?: unknown;
            message?: unknown;
        };
    };
};

function toNonEmptyString(value: unknown): string | null {
    if (typeof value !== 'string') {
        return null;
    }

    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
}

function getDetailMessage(detail: unknown): string | null {
    if (Array.isArray(detail)) {
        const message = detail
            .map((item) => {
                if (!item || typeof item !== 'object') {
                    return null;
                }

                return toNonEmptyString((item as ApiErrorDetailItem).msg);
            })
            .filter((item): item is string => Boolean(item))
            .join(', ');

        return toNonEmptyString(message);
    }

    return toNonEmptyString(detail);
}

export function getApiErrorStatus(error: unknown): number | null {
    const status = (error as ApiErrorLike | null)?.response?.status;
    return typeof status === 'number' ? status : null;
}

export function getApiErrorMessage(
    error: unknown,
    fallback = 'Có lỗi xảy ra.',
): string {
    const apiError = error as ApiErrorLike | null;

    const detailMessage = getDetailMessage(apiError?.response?.data?.detail);
    if (detailMessage) {
        return detailMessage;
    }

    const responseMessage = toNonEmptyString(apiError?.response?.data?.message);
    if (responseMessage) {
        return responseMessage;
    }

    const directMessage = toNonEmptyString(apiError?.message);
    if (directMessage) {
        return directMessage;
    }

    return fallback;
}

export function isOptionalEndpointError(error: unknown): boolean {
    const status = getApiErrorStatus(error);

    return (
        status === 404 ||
        status === 405 ||
        status === 429 ||
        status === 500 ||
        status === 501 ||
        status === 502 ||
        status === 503
    );
}
