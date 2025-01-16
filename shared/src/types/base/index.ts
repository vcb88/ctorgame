/**
 * Base types exports
 */

// Core functionality
export * from './constants.js';
export * from './errors.js';
export * from './payloads.js';
export * from './minimal.js';

// Legacy types
import type { BaseError } from './errors.js';
import type {
    MessagePayload,
    ErrorPayload,
    EventPayload,
    CommandPayload,
    ResponsePayload,
    GameActionPayload,
    NotificationPayload
} from './payloads.js';
import type {
    Numeric,
    Text,
    Flag,
    Validation,
    Metadata,
    Identified,
    Versioned,
    Timed,
    Expirable,
    Activatable,
    Orderable,
    Named,
    Described,
    Statusable,
    Taggable,
    Configurable,
    Trackable,
    Ownable
} from './minimal.js';

// Legacy exports
export type {
    BaseError as IError,
    MessagePayload as stringPayload,
    ErrorPayload as IErrorPayload,
    EventPayload as IEventPayload,
    CommandPayload as ICommandPayload,
    ResponsePayload as IResponsePayload,
    GameActionPayload as IGameActionPayload,
    NotificationPayload as INotificationPayload,
    
    // Minimal interfaces
    Numeric as INumeric,
    Text as IText,
    Flag as IFlag,
    Validation as IValidation,
    Metadata as IMetadata,
    Identified as IIdentified,
    Versioned as IVersioned,
    Timed as ITimed,
    Expirable as IExpirable,
    Activatable as IActivatable,
    Orderable as IOrderable,
    Named as INamed,
    Described as IDescribed,
    Statusable as IStatusable,
    Taggable as ITaggable,
    Configurable as IConfigurable,
    Trackable as ITrackable,
    Ownable as IOwnable
};