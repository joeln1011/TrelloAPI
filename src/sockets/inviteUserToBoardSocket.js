// Param socket from socket.io server

export const inviteUserToBoardSocket = (socket) => {
  // listen events from Client emit (FE_USER_INVITED_TO_BOARD)
  socket.on('FE_USER_INVITED_TO_BOARD', (invitation) => {
    //emit event to all clients ecept the sender
    socket.broadcast.emit('BE_USER_INVITED_TO_BOARD', invitation);
  });
};
