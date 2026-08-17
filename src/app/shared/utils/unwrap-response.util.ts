export function unwrapResponse(response: any): any {
  return response && response.data ? response.data : response;
}
