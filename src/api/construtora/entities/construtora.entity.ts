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
        this.id = partial.id;
        this.cnpj = partial.cnpj;
        this.razaosocial = partial.razaosocial;
        this.fantasia = partial.fantasia;
        this.tel = partial.tel;
        this.email = partial.email;
        this.obs = partial.obs;
        this.status = partial.status;
        this.valor_cert = partial.valor_cert;
        this.financeiroId = partial.financeiroId;
        this.responsavelId = partial.responsavelId;
        this.createdAt = partial.createdAt;
        this.updatedAt = partial.updatedAt;
    }
}
