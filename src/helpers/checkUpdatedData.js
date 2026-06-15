// Description: Helper function to check updated data and return the updated data.
const checkUpdatedData = async (bodyData) => {
  try {
    // Prepare a dataToUpdate object with updatedBy and updatedAt fields.
    const dataToUpdate = {
      updatedBy: bodyData.userId ? bodyData.userId : null,
      updatedAt: Date.now(),
    };

    // Define keys to exclude from being added to dataToUpdate.
    const excludeKeys = ['userId', 'eventCode'];

    // Loop through the bodyData object and add the key-value pairs to the dataToUpdate object.
    Object.keys(bodyData).forEach((key) => {
      if (
        !excludeKeys.includes(key) &&
        bodyData[key] !== undefined &&
        bodyData[key] !== null
      ) {
        dataToUpdate[key] = bodyData[key];
      }
    });

    // Return the updated data object.
    return dataToUpdate;
  } catch (error) {
    console.log('Error in checkUpdatedData helper --> ', error);
    throw new Error(error);
  }
};

module.exports = { checkUpdatedData };
