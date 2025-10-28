export default interface BaseResponseType {
    aimodel: {
        model: string;
        tooltip: string;
    };
    contentType: string;
    wordCount: number;
}