const validator = require('validator')
const db = require('../db')
const NAME_VALIDATION =/L[5,6]-[0-9]+/;
const ingestor = {
  FIELD_NAMES: {
    NAME: 'name',
    QUANTITY: 'q',
    DATE: 'dt'
  }
}
ingestor.ingest = (data) => {
  const eventDate = new Date(data.dt);
  eventDate.setMinutes(0, 0, 0); 
  data.dt=eventDate.toISOString();
  
  if(db.hasTimeEntry(data)){
     db.updateTimeEntry(data);
  } else {
     db.insertRecord(data);
  }
  db.clearOldEntries();

  return;
}

ingestor.validate = data => {
  if(!data[ingestor.FIELD_NAMES.NAME] || !validator.matches(data[ingestor.FIELD_NAMES.NAME], NAME_VALIDATION))
  {
    throw `${ingestor.FIELD_NAMES.NAME} needs to be in format ${NAME_VALIDATION}, received '${data[ingestor.FIELD_NAMES.NAME]}'`;
  }
  if(!data[ingestor.FIELD_NAMES.QUANTITY] || !validator.isFloat(data[ingestor.FIELD_NAMES.QUANTITY]+''))
  {
    throw `${ingestor.FIELD_NAMES.QUANTITY} needs to be a float, , received '${data[ingestor.FIELD_NAMES.QUANTITY]}'`;
  }
  if(!data[ingestor.FIELD_NAMES.DATE] || !validator.isISO8601(data[ingestor.FIELD_NAMES.DATE]+''))
  {
    throw `${ingestor.FIELD_NAMES.DATE} needs to be in ISO8601 format, , received '${data[ingestor.FIELD_NAMES.DATE]}'`;
  }

  return true;
}

module.exports = ingestor;