export class ResponseEntity <T>{
    error: boolean;
    message: string;
    status: number;
    data: T;
    total: number;
    page: number;
}
