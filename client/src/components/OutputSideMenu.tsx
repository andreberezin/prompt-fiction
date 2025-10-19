import '../styles/output-side-menu.scss'
import {GrUpdate} from "react-icons/gr";
import {TbSeo} from "react-icons/tb";

export function OutputSideMenu() {
    return (
        <div
            id="output-side-menu"
        >

            <button className={'hover-icon-button'}>
                <GrUpdate />
            </button>
            <button className={'hover-icon-button'}>
                <TbSeo />
            </button>
        </div>
    )
}