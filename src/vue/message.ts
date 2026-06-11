import { message, messageSuccess, messageError, messageWarning } from '../components/message/message.js'
import type { MessageOptions } from '../components/message/message.js'

export function useMkMessage() {
  return {
    show: message,
    success: messageSuccess,
    error: messageError,
    warning: messageWarning,
  }
}
