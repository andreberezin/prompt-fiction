import * as React from "react";
import type {ContentType} from "../../types/ContentType.ts";
import {CONTENTTYPES} from "../../types/ContentType.ts";
import '../../styles/main/navbar.scss'

interface NavBarProps {
    contentType: ContentType;
    setContentType: React.Dispatch<React.SetStateAction<ContentType>>
}

const renderButtons = ({ contentType, setContentType }: NavBarProps) => {
    return CONTENTTYPES.map((type) => (
        <button
            key={type}
            onClick={() => setContentType(type)}
            className={`navbar-button ${contentType === type ? "active" : "inactive"}`}
        >
            {type}
        </button>
    ));
};

export default function NavBar(props: NavBarProps) {
    return (
        <div
        className='nav-bar'
        >
            {renderButtons(props)}
            <img src={'gw_logo_without_text.png'} alt={'logo'} className={'logo'}></img>
        </div>
    )
}