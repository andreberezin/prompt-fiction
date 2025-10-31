import '../../styles/form-output/keywords.scss'

interface SEOkeywordsProps {
    keywords?: string[];
}


export function SEOkeywords({ keywords }: SEOkeywordsProps) {
    if (!keywords || keywords.length === 0) return null;

    return (
        <div id="seo-keywords">
            <p>SEO keywords: {keywords.join(", ")}</p>
        </div>
    );
}