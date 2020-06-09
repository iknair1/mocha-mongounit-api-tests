const serverMongoose = require('../../server/data/mongoose');
const { getOrganisation, getRole, getUser, getProperty, getBeacon } = require('../../server/data/schema/schemaKeys')
const setUpSchemas = () => serverMongoose()

const populateModel = async (model, namefortests) => {
    const { data, getFunction, fields } = model;
    const Model = getFunction();
    let savedCount = 0;
    for (var i = 0; i < data.length; i++) {
        var item = data[i];
        var modelData = {}
        fields.forEach(field => {
            modelData[field] = item[field];
        });
        var model = new Model(modelData);
        
        try {
            const saved = await model.save();
            if (namefortests) {
            }
            
            item.savedId = saved._id;
            savedCount++;
        } catch (e) {
            if (namefortests) {
            }
            console.log(e);
            continue;
        }
        
        
    }
    if (namefortests) {
    }
    
}

const modelData = {

    organisations: {
        fields: ['name'],
        data: require('./test-data/organisations.json'),
        getFunction: getOrganisation
    },
    roles: {
        fields: ['name', 'resources'],
        data: require('./test-data/roles.json'),
        getFunction: getRole
    },
    properties: {
        fields: ['name', 'domains', 'key'],
        data: require('./test-data/properties.json'),
        getFunction: getProperty
    },
    users: {
        fields: ['email', 'googleProvider'],
        data: require('./test-data/users.json'),
        getFunction: getUser
    },
    beacons: {
        fields: ['referrer', 'userAgent', 'deviceType', 'connectionType', 'session', 'ipAddress', 'created', 'timing'],
        data: require('./test-data/beacons.json'),
        getFunction: getBeacon
    }
}

const findRaw = (raw, id) => raw.find(d => d._id == id);
const populateModelsWithoutRelationships = async () => {
    const promises = [];
    Object.values(modelData).forEach(model => promises.push(populateModel(model, model.fields[0] == 'referrer')))
    await Promise.all(promises);
    //await populateModel(modelData.users)
    //await populateModel(modelData.organisations)
    
}

const connectUsersToOrganisationsAndRoles = async () => {
    

    await connectXToY(modelData.users, 'organisation', 'users', modelData.organisations, 'email');
    await connectXToY(modelData.users, 'role', 'users', modelData.role, 'email');

    
}

const connectPropertiesToOrganisations = async () => {
    
    await connectXToY(modelData.properties, 'organisation', 'properties', modelData.organisations, 'name');
    
}

const connectBeaconsToProperties = async () => {
    await connectXToY(modelData.beacons, 'property', 'beacons', modelData.properties, 'referrer');
}

const connectXToY = async (rawX, key, foreignKey, YRawData, identifier) => {
   const data = rawX.data;

   for (var i = 0; i < data.length; i++) {
       const raw = data[i];
       if (!raw[key]) {
         console.log(`model <${raw[identifier]}> has no ${key}`);
        } else if (!raw.savedId) {
            
                console.log('no saved id')
            
    } else {
        
        const Model = rawX.getFunction()
        
        let retrievedX;
        try {
            //console.log(raw)
            retrievedX = await Model.findById(raw.savedId).exec();
        } catch (ee) {
            continue;
            
        }
        
        if (!retrievedX) {
           
            console.log('no model', raw.savedId);
           
            
            continue;
        }
        
        
        const rawY = findRaw(YRawData.data, raw[key]);
        const retrievedY = await YRawData.getFunction().findById(rawY.savedId).exec();
        if (!retrievedY) {
            console.log('no retrievedY');
            continue;
        }
        


        retrievedX[key] = retrievedY
        retrievedY[foreignKey] = retrievedY[foreignKey] || [];
        retrievedY[foreignKey].push(retrievedX);
        
        await retrievedX.save();
        await retrievedY.save();
    }
   }
   
}

const populate = async () => {
    setUpSchemas();
    await populateModelsWithoutRelationships();

    // At this stage "savedId" should be set on the raw data
    await connectUsersToOrganisationsAndRoles();
    console.log('connecting properties to organisations')
    await connectPropertiesToOrganisations();
    await connectBeaconsToProperties();
}



const getTokenForUser = async () => {
    const User = modelData.users.getFunction();
    const a = await User.findOne({email: 'davearcher79@gmail.com'}).populate('organisation').exec();
    

    const createToken = require('./../../server/data/tokens').createToken;
    const user = modelData.users.data.find(u => u.email == 'davearcher79@gmail.com');

    
    const new_token = createToken({id:a._id});
    return new_token;
}

const getTokenForUserWithNoSiteAccess = async () => {
    const User = modelData.users.getFunction();
    const a = await User.findOne({email: 'iknair1@gmail.com'}).populate('organisation').exec();


    const createToken = require('./../../server/data/tokens').createToken;
    const user = modelData.users.data.find(u => u.email == 'iknair1@gmail.com');


    const new_token = createToken({id:a._id});
    return new_token;

}

const getUserFn = async () => {
    const User = modelData.users.getFunction();
    const a = await User.findOne({email: 'davearcher79@gmail.com'}).populate('organisation').exec();
    
    return a;
}

module.exports = {
    populate,
    getTokenForUser,
    getTokenForUserWithNoSiteAccess,
    getUser: getUserFn
}

const f = () => {
    const final = [];
    let count = 0;
    modelData.beacons.data.forEach(b => {
        //if (count == 10) return;
    
        b.connectionType = '4g';
        b.deviceType = 'mobile'
        b.session = 'some-session'
        b.userAgent = 'ok-fine-chrome'
    
        //final.push(b);
        //count++;
        
    })
    
    let fs = require('fs');
    
    let ddd = JSON.stringify(modelData.beacons.data.slice(0,10), null, 2);
    fs.writeFileSync('student-2.json', ddd);
}
