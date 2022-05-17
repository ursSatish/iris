import {Injectable} from '@angular/core';
import { Observable } from 'rxjs';
@Injectable({ providedIn: 'root' })
export abstract class BaseService {
    constructor() { }
    public abstract get(id: string | number): Observable<any>;
    public abstract search(criteria: any): Observable<any>;
    public abstract save(model: any): Observable<any>;
}