import {fal, QueueStatus} from "@fal-ai/client";

const endpoint = "fal-ai/recraft/v3/text-to-image";

export function configurate(apiKey: string){
    fal.config({
        credentials: apiKey
    })
}

export async function queueImage(prompt: string){
    const { request_id } = await fal.queue.submit(endpoint, {
        input: {
            prompt: prompt
        },
    });

    return request_id;
}

export async function generateImage(prompt: string, onQueueUp: (status: QueueStatus) => void){
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

export async function getQueueResult(requestId: string){
    const result = await fal.queue.result(endpoint, {
        requestId: requestId
    });

    return result.data.images.at(0)?.url;
}