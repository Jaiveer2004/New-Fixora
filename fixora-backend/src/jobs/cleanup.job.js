const cron = require('node-cron');
const User = require('../models/user.model')

const cleanupUnverifiedAccounts = cron.schedule('0 * * * *', async () => {
  try {
    const deletionHours = parseInt(process.env.UNVERIFIED_ACCOUNT_DELETION_HOURS) || 24;
    const cutOffDate = new Date(Date.now() - deletionHours * 60 * 60 * 1000);

    const result = await User.deleteMany({
      isEmailVerified: false,
      createdAt: { $lt: cutOffDate },
    });

    if (result.deletedCount > 0) {
      console.log(`✅ Deleted ${result.deletedCount} unverified accounts`);
    }
  } catch (error) {
    console.error('Error cleaning up unverified accounts:', error);
  }
});

module.exports = cleanupUnverifiedAccounts;