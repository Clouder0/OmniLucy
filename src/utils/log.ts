import pino from "pino";

const log = pino();

// configurations should be added here if needed
log.level = "debug"; // TODO: use INFO level in production mode

export default log;
