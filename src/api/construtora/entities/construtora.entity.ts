import { ApiResponseProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";

export class Construtora {

    @ApiResponseProperty({ type: Number })
    @Expose()
    id: number;

    @ApiResponseProperty({ type: String })
    @Expose()
    cnpj: string;

    @ApiResponseProperty({ type: String })
    @Expose()
    razaosocial: string;

    @ApiResponseProperty({ type: String })
    @Expose()
    fantasia: string;

    @ApiResponseProperty({ type: String })
    @Expose()
    tel: string;

    @ApiResponseProperty({ type: String })
    @Expose()
    email: string;

    @ApiResponseProperty({ type: String })
    @Expose()
    obs: string;

    @ApiResponseProperty({ type: Boolean })
    @Expose()
    status: boolean;

    @ApiResponseProperty({ type: Number })
    @Expose()
    valor_cert: number;

    @ApiResponseProperty({ type: Number })
    @Expose()
    financeiroId: number;

    @ApiResponseProperty({ type: Number })
    @Expose()
    responsavelId: number;

    @ApiResponseProperty({ type: Date })
    @Expose()
    createdAt: Date;

    @ApiResponseProperty({ type: Date })
    @Expose()
    updatedAt: Date;

    constructor(partial: Partial<Construtora>) {
        Object.assign(this, partial);
    }
}
