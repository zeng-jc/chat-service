export enum ErrorCode {
  /** 权限状态码 **/
  INVALID_IDENTITY_INFORMATION = '401',
  PERMISSION_DENIED = '403',
  /** auth状态码 */
  TOKEN_INVALID = '10000',
  YOU_DO_NOT_OWN_THIS_RESOURCE = '10002',
  VERIFICATION_CODE_ERROR = '10003',
  VERIFICATION_CODE_SEND_FAILED = '10004',
  /** 用户状态码 **/
  UNKNOWN_ERROR = '100001', //未知错误
  USER_ID_INVALID = '100002', //用户id无效
  USER_NOT_EXIST = '100003',
  USER_EXIST = '100004',
  EMAIL_EXIST = '100005',
  AVATAR_UNSUPPORTED_FILE_TYPE = '100006',
}
