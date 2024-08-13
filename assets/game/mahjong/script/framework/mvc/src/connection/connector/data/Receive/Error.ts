
// errorID = 0
//   faultCode = "AMFPHP_RUNTIME_ERROR"
//   faultDetail = "E:\xampplite\htdocs\sites\webservices\sites\all\modules\services\servers\amfphp\amfphp.module on line 101"
//   faultString = "Method <em>DiscoveryService.getServices</em> does not exist."
//   message = "faultCode:AMFPHP_RUNTIME_ERROR faultString:'Method 


// {
//   "error": "DUPLICATE_BALANCEEXCHANGE_BALANCEEXCHANGE_KEY_ERROR",
//       "error_code": 1354000210,
//       "event": false,
//       "result": "error"
//     }

// {event: false, ErrorID: '1350000132', errCode: 'API_EC_ACC_SID_INVALID'}



export type Error_Result_1 = {
    event: false;
    error: string;
    error_code: string;
};


export type Error_Result_2 = {
    event: false;
    ErrorID: string;
    errCode: string;
};

export type Amf_Error_Result = {
    errorID: string;
    faultCode: string;
    falutDetail: string;
    faultString: string;
    message: string;
    name: string;
};


export type Error_Result = Error_Result_1 | Error_Result_2 | Amf_Error_Result;

