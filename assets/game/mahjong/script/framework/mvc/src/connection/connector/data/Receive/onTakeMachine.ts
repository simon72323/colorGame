// {
//     "action": "onTakeMachine",
//     "result": {
//         "data": {
//             "GameCode": 2,
//             "event": true
//         },
//         "event": true,
//         "tokenId": "/1"
//     }
// }

// {
//     error: 'MACHINE_OCCUPIED_FAIL',
//     errCode: 1354000254,
//     event: false,
//     result: 'error',
//     tokenId: '/3'
//   }
export interface onTakeMachine {
    GameCode?: number,
    gameCode?: number,
    event: true;
}

// type onTakeMachineData = {
//     GameCode?: number,
//     gameCode?: number,
//     event: true;
// };
// type onTakeMachineSuccess = {
//     event: true,
//     data: onTakeMachineData;
// };

// type onTakeMachineFail = {
//     event: false,
//     error: 'MACHINE_OCCUPIED_FAIL' | "OCCUPY_TOO_FREQUENTLY",
//     errCode: 1354000254 | 1350000113 | 1350000107;
// };

