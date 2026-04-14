import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface TransformedResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  meta?: unknown;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, TransformedResponse<T>>
{
  intercept(
    _context: ExecutionContext,
    next: CallHandler,
  ): Observable<TransformedResponse<T>> {
    return next.handle().pipe(
      map((response: { data?: T; message?: string; meta?: unknown } | T) => {
        if (response && typeof response === 'object' && 'data' in response) {
          const { data, message, meta } = response as {
            data: T;
            message?: string;
            meta?: unknown;
          };
          return { success: true, data, ...(message ? { message } : {}), ...(meta ? { meta } : {}) };
        }
        return { success: true, data: response as T };
      }),
    );
  }
}
