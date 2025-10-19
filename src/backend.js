// In-memory store for flagged project IDs (ephemeral, resets on app restart)
let flaggedProjectIds = [];

exports.httpHandler = {
  endpoints: [
    // Add/remove a single flagged project ID
    {
      method: 'POST',
      path: 'flags',
      handle: function handle(ctx) {
        const body = ctx.request.json();
        const projectId = body.projectId;
        const flagged = body.flagged;

        if (flagged) {
          flaggedProjectIds.push(projectId);
        } else {
          const index = flaggedProjectIds.indexOf(projectId);
          if (index > -1)
            flaggedProjectIds.splice(index, 1);
        }

        ctx.response.json({projectIds: flaggedProjectIds});
      }
    },

    // Get all flagged project IDs
    {
      method: 'GET',
      path: 'flags',
      handle: function handle(ctx) {
        ctx.response.json({projectIds: flaggedProjectIds});
      }
    }
  ]
};
