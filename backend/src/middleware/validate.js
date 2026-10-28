import { HttpError } from '../utils/http-error.js';

export function validate(schema, source = 'body') {
  return (req, _res, next) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      const message = result.error.issues.map((issue) => issue.message).join('; ');
      return next(new HttpError(400, message));
    }
    req.validated = { ...req.validated, [source]: result.data };
    if (source !== 'query') req[source] = result.data;
    return next();
  };
}
