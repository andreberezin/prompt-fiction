export default interface BaseRequestType {
    aimodel: {
        model: string;
        tooltip: string;
    };
    contentType: string;
    wordCount: number;
}