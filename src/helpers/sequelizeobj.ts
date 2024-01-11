import { Includeable } from "sequelize";

interface sequelizeObj {
    currencyformat?: string;
    where?: Record<string, unknown>;
    attributes?: Array<string> | Record<string, unknown> | Array<unknown>;
    include?: Array<Record<string, unknown>>;
    order?: Array<[string]> | Array<[string, string]> | Array<[string, string, string]>;
    limit?: number | string,
    offset?: number | string,
    group?: string[] | string,
    transaction?: boolean,
    model?: Includeable,
    as?: string,
    paranoid?: boolean,
    required?: boolean,
    separate?: boolean,
    replacements?: Record<string, unknown>;
    type?: string;
    dateformat?: string;
    tenant?: Record<string, unknown>;
};

export { sequelizeObj }
