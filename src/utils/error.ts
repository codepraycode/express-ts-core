import logger from "./logger";

export class BaseError extends Error {
	public readonly name: string;
	public readonly statusCode: number;
	public readonly isOperational: boolean;
	public readonly metadata: any;

	constructor(
		message: string,
		statusCode: number,
		name = "BaseError",
		metadata: any = null,
		isOperational = true
	) {
		super(message);
		Object.setPrototypeOf(this, new.target.prototype); // Modern way to restore prototype chain

		this.name = name;
		this.statusCode = statusCode;
		this.isOperational = isOperational;
		this.metadata = metadata;

		// Centralized logging: Automatically logs the class name and metadata
		logger.error(`[${this.name}] ${message}`, {
			statusCode: this.statusCode,
			metadata: this.metadata,
			stack: this.stack, // Capturing stack trace for easier debugging
		});
	}
}
