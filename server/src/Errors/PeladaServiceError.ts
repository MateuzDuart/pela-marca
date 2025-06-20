export default class PeladaServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PeladaServiceError";
  }
}