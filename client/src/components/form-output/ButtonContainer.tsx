import {TbReload, TbSeo} from "react-icons/tb";
import {RiFullscreenExitFill, RiFullscreenFill} from "react-icons/ri";
import * as React from "react";
import type {HasMetaData} from "../../types/props/HasMetadata.ts";

interface ButtonContainerProps<T extends HasMetaData>{
    isTextEdited: boolean;
    response: T;
    showSEO: boolean;
    setShowSEO: React.Dispatch<React.SetStateAction<boolean>>;
    showForm: boolean;
    setShowForm: React.Dispatch<React.SetStateAction<boolean>>;
    updateResponseObject: (e: React.MouseEvent<HTMLButtonElement>) => void;
    SEO?: boolean;
    refresh?: boolean;
    fullscreen?: boolean;
}

export function ButtonContainer<T extends HasMetaData>({isTextEdited, response, showSEO, setShowSEO, showForm, setShowForm, updateResponseObject,
                   SEO = false, refresh = false, fullscreen = false}: ButtonContainerProps<T>) {

    return (
        <div id='button-container'>
           <div className={'button-wrapper'}>
            {refresh &&
				<button
					id='refresh-button'
					data-tooltip='Update'
					className={`hover-icon-button ${!isTextEdited? "disabled" : "flash"}`}
					disabled={!isTextEdited}
					onClick={(e) => updateResponseObject(e)}
				>
					<TbReload className='icon'/>
				</button>
            }
           </div>
                <div className={'button-wrapper'}>
                    {SEO &&
					<button
						id='seo-button'
						data-tooltip='SEO keywords'
						className={`hover-icon-button ${response.metadata?.seoKeywords?.length === 0 ? "disabled" : ""} ${showSEO ? "active" : ""}`}
						disabled={response.metadata?.seoKeywords?.length === 0}
						onClick={() => setShowSEO(!showSEO)}
					>
						<TbSeo className='icon'/>
					</button>
                    }
                </div>
                <div className="button-wrapper">
                    {fullscreen &&
					<button
						id='fullscreen-button'
						data-tooltip='Fullscreen'
						className='hover-icon-button'
						onClick={() => setShowForm(!showForm)}
					>
                        {showForm &&  <RiFullscreenFill className='icon'/>}
                        {!showForm &&  <RiFullscreenExitFill className='icon'/>}
					</button>
                    }
                </div>
        </div>
    )
}