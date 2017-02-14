import { ODataFilterBuilder, ODataFilterExpression } from './ODataFilterBuilder';
import { ODataOperation } from './ODataOperation';
import { ODataQueryResult } from './ODataQueryResult';

export class ODataQuery<T> extends ODataOperation<T> {
    private _filter: string;
    private _top: number;
    private _skip: number;
    private _orderBy: string;

    private evaluate: (queryString) => Promise<ODataQueryResult<T>>;

    private buildQueryUrl(): string {
        let url = '?';
        if (this._filter) { url += `$filter=${this._filter}&`; }
        if (this._top) { url += `$top=${this._top}&`; }
        if (this._skip) { url += `$skip=${this._skip}&`; }
        if (this._orderBy) { url += `$orderby=${this._orderBy}&`; }
        if (this._expand) { url += `$expand=${this._expand}&`; }
        if (this._select) { url += `$expand=${this._select}&`; }
        return url;
    }

    constructor(_evaluate: (queryString) => Promise<ODataQueryResult<T>>) {
        super();
        this.evaluate = _evaluate;
    }

    public Filter(filter: string): ODataQuery<T> {
        this._filter = filter;
        return this;
    };

    public BuildFilter(build: (b:ODataFilterExpression<T>) => void): ODataQuery<T>{
        let builder = ODataFilterBuilder.Create<T>();
        build(builder);
        this._filter = builder.filterBuilderRef.toString();
        return this;
    }

    public Top(top: number): ODataQuery<T> {
        this._top = top;
        return this;
    };

    public Skip(skip: number): ODataQuery<T> {
        this._skip = skip;
        return this;
    }

    public OrderBy<K extends keyof T>(...orderBy: K[]): ODataQuery<T> {
        this._orderBy = this.parseStringOrStringArray(...orderBy);
        return this;
    }

    public async Exec(): Promise<ODataQueryResult<T>> {
        let queryUrl = this.buildQueryUrl();
        return await this.evaluate(queryUrl);
    }
}
