import type {HasMetaData} from "../../types/props/HasMetadata.ts";

interface MetadataContainerProps<T extends HasMetaData> {
    retryCounter: number;
    generationTime: number;
    response: T;
    wordCount: boolean;
    estimateReadTime: boolean;
    generationTimer: boolean;
}

export function MetadataContainer<T extends HasMetaData>({retryCounter, generationTime, response,
     wordCount = false, estimateReadTime = false, generationTimer = false}: MetadataContainerProps<T>) {

    return (
        <div id='metadata-container'>
            {generationTimer &&
				<div className='data'>
					<p className='value'
					   id='generation-timer'
					   data-attemptcount={retryCounter}
					>
                        {generationTime > 0 ? (generationTime / 1000).toFixed(2) : "0.00"}
					</p>
				</div>
            }
            {wordCount && response.metadata.wordCount != null &&
				<div className='data'>
					<p className='value'>{response.metadata?.wordCount || 0}</p>
					<p className='text'>words</p>
				</div>
            }

            {estimateReadTime && response.metadata.estimatedReadTime &&
				<div className='data'>
					<p className='value'>{response.metadata?.estimatedReadTime || "0 min"}</p>
					<p className='text'>read</p>
				</div>
            }
        </div>
    )
}