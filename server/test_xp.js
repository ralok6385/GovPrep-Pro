const { awardXP } = require('./controllers/gamificationController'); awardXP('697ceb49644a75b308adf758', 100, 'Test').then(console.log).catch(console.error).then(() => process.exit());
