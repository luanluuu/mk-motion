import {
  message,
  messageSuccess,
  messageError,
  messageWarning,
} from '../../components/message/message.js'
import type { MessageOptions } from '../../components/message/message.js'

export function useMkMessage() {
  return {
    message: (msg: string, options?: MessageOptions) => message(msg, options),
    messageSuccess: (msg: string, options?: Omit<MessageOptions, 'type'>) => messageSuccess(msg, options),
    messageError: (msg: string, options?: Omit<MessageOptions, 'type'>) => messageError(msg, options),
    messageWarning: (msg: string, options?: Omit<MessageOptions, 'type'>) => messageWarning(msg, options),
  }
}
