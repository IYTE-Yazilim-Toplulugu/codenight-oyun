import { ApiError, fal, QueueStatus } from "@fal-ai/client";

const endpoint = "fal-ai/imagen4/preview/fast";

export function configure(apiKey: string) {
    fal.config({
        credentials: apiKey
    })
}

export async function checkApiKey(apiKey: string) {
    try {

        configure(apiKey);
        await fal.queue.status(endpoint, { requestId: "furkanigotten" });

    } catch (e: ApiError<any> | any) {
        return e.status == 404;
    }

    return true;
}

export async function queueImage(prompt: string) {
    const { request_id } = await fal.queue.submit(endpoint, {
        input: {
            prompt: prompt
        },
    });

    return request_id;
}

export async function generateImage(prompt: string, onQueueUp: (status: QueueStatus) => void) {
    const result = await fal.subscribe(endpoint, {
        input: {
            prompt,
            image_size: "square_hd",
        },
        pollInterval: 5000,
        logs: true,
        onQueueUpdate: onQueueUp
    });

    return result.data.images.at(0)?.url;
}

export async function getQueueResult(requestId: string) {
    const result = await fal.queue.result(endpoint, {
        requestId: requestId
    });

    return result.data.images.at(0)?.url;
}
