/**
 * Type guards and utilities for OpenAPI type handling in tests
 */
import type { OpenAPIV3 } from 'openapi-types';

/**
 * Type guard to check if a document is OpenAPI v3
 */
export function isOpenAPIV3Document(doc: unknown): doc is OpenAPIV3.Document {
  return (
    typeof doc === 'object' &&
    doc !== null &&
    'openapi' in doc &&
    typeof (doc as any).openapi === 'string' &&
    (doc as any).openapi.startsWith('3.')
  );
}

/**
 * Type guard for OpenAPI v3 operation object
 */
export function isOperationObject(
  obj: unknown
): obj is OpenAPIV3.OperationObject {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    ('responses' in obj || 'parameters' in obj || 'requestBody' in obj)
  );
}

/**
 * Type guard for OpenAPI v3 response object
 */
export function isResponseObject(
  obj: unknown
): obj is OpenAPIV3.ResponseObject {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'description' in obj &&
    !('$ref' in obj)
  );
}

/**
 * Safely get OpenAPI v3 document with type assertion
 */
export function getOpenAPIV3Document(
  swagger: () => unknown
): OpenAPIV3.Document {
  const doc = swagger();
  if (!isOpenAPIV3Document(doc)) {
    throw new Error('Expected OpenAPI v3 document but got different format');
  }
  return doc;
}

/**
 * Safely access path item operations
 */
export function getPathOperations(
  pathItem: OpenAPIV3.PathItemObject
): Record<string, OpenAPIV3.OperationObject> {
  const operations: Record<string, OpenAPIV3.OperationObject> = {};
  const methods = [
    'get',
    'post',
    'put',
    'delete',
    'patch',
    'options',
    'head',
  ] as const;

  for (const method of methods) {
    const operation = pathItem[method];
    if (operation && isOperationObject(operation)) {
      operations[method] = operation;
    }
  }

  return operations;
}
