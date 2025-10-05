import '../styles/form.scss'
import Output from "./Output.tsx";

export default function BlogForm() {

    const togglePlaceholder = (value: string, labelId: string ) => {
        const labelElement = document.getElementById(labelId);
        if (value && labelElement) {labelElement.classList.add('filled');}
        if (!value && labelElement) {labelElement.classList.remove('filled');}
    }

    const showPlaceholder = (labelId: string) => {
        const labelElement = document.getElementById(labelId);
        if (labelElement) {
            labelElement.classList.add('filled');
        }
    }

    const hideplaceholder = (value: string, labelId: string) => {
        const labelElement = document.getElementById(labelId);
        if (labelElement && !value) {
            labelElement.classList.remove('filled');
        }
    }

    const handleSubmit = () => {

    }

    return (
        <div
            id={'blog'}
            className={'container'}
        >

            <form
                id={'blog-form'}
                onSubmit={handleSubmit}
            >
                <label
                    id={'topic'}
                    className={'long'}
                    data-placeholder={'topic'}
                >
                    <input
                        autoFocus={true}
                        type='text'
                        name={'topic'}
                        placeholder={'topic'}
                        onChange={(e) => togglePlaceholder(e.target.value, e.target.name)}
                        onFocus={(e) => showPlaceholder(e.target.name)}
                        onBlur={(e) => hideplaceholder(e.target.value, e.target.name)}
                    />
                </label>
                <label
                    id={'target-audience'}
                    className={'long'}
                    data-placeholder={'target audience'}
                >
                    <input
                        type='text'
                        name={'target-audience'}
                        placeholder={'target audience'}
                        onChange={(e) => togglePlaceholder(e.target.value, e.target.name)}
                        onFocus={(e) => showPlaceholder(e.target.name)}
                        onBlur={(e) => hideplaceholder(e.target.value, e.target.name)}
                    />
                </label>
                <div
                className={'double'}
                >
                    {/*todo might switch to a <select> dropdown menu later*/}
                    <label
                        id={'tone'}
                        className={'short'}
                        data-placeholder={'tone'}
                    >
                        <input
                            className={'filled'}
                            type='text'
                            name={'tone'}
                            placeholder={'tone'}
                            onChange={(e) => togglePlaceholder(e.target.value, e.target.name)}
                            onFocus={(e) => showPlaceholder(e.target.name)}
                            onBlur={(e) => hideplaceholder(e.target.value, e.target.name)}
                        />
                    </label>

                    {/*todo might switch to a <select> dropdown menu later*/}
                    <label
                        id={'expertise-level'}
                        className={'short'}
                        data-placeholder={'expertise'}
                    >
                        <input
                            type='text'
                            name={'expertise-level'}
                            placeholder={'expertise level'}
                            onChange={(e) => togglePlaceholder(e.target.value, e.target.name)}
                            onFocus={(e) => showPlaceholder(e.target.name)}
                            onBlur={(e) => hideplaceholder(e.target.value, e.target.name)}
                        />
                    </label>
                </div>
                <div
                className={'double'}
                >
                    <label
                        id={'word-count'}
                        className={'short'}
                        data-placeholder={'words'}
                    >
                        <input
                            type='number'
                            name={'word-count'}
                            placeholder={'word count'}
                            min={0}
                            max={1000}
                            onChange={(e) => togglePlaceholder(e.target.value, e.target.name)}
                            onFocus={(e) => showPlaceholder(e.target.name)}
                            onBlur={(e) => hideplaceholder(e.target.value, e.target.name)}
                        />
                    </label>

                    {/*todo switch to boolean tickbox later ("yes" or "no")*/}
                    <label
                        id={'seo-focus'}
                        className={'short'}
                        data-placeholder={'seo'}
                    >
                        Seo Focus
                        <input
                            type='checkbox'
                            name={'seo-focus'}
                        />
                        {/*<input*/}
                        {/*    type='text'*/}
                        {/*    name={'seo-focus'}*/}
                        {/*    placeholder={'seo focus'}*/}
                        {/*    onChange={(e) => togglePlaceholder(e.target.value, e.target.name)}*/}
                        {/*    onFocus={(e) => showPlaceholder(e.target.name)}*/}
                        {/*    onBlur={(e) => hideplaceholder(e.target.value, e.target.name)}*/}
                        {/*/>*/}
                    </label>
                </div>
            </form>
            <Output/>
        </div>
    )
}