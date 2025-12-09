const fs = require('fs-extra');
const { XMLParser } = require('fast-xml-parser');

/**
 * Parse JMX file and extract Thread Groups
 * @param {string} jmxPath - Path to JMX file
 * @returns {Array} Array of thread groups with name and enabled status
 */
function parseJMX(jmxPath) {
  try {
    // Read JMX file
    const jmxContent = fs.readFileSync(jmxPath, 'utf-8');
    
    // Parse XML
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_'
    });
    
    const jmxData = parser.parse(jmxContent);
    
    // Navigate to test plan
    const testPlan = jmxData.jmeterTestPlan?.hashTree;
    if (!testPlan) {
      return [];
    }
    
    // Find thread groups
    const threadGroups = [];
    
    // JMeter structure: jmeterTestPlan > hashTree > TestPlan > hashTree > ThreadGroup
    function findThreadGroups(obj, depth = 0) {
      if (!obj || depth > 10) return; // Prevent infinite recursion
      
      if (Array.isArray(obj)) {
        obj.forEach(item => findThreadGroups(item, depth + 1));
      } else if (typeof obj === 'object') {
        // Check if this is a ThreadGroup
        if (obj['@_testclass'] === 'ThreadGroup') {
          const name = obj['@_testname'] || 'Unnamed Thread Group';
          const enabled = obj['@_enabled'] !== 'false'; // Default true if not specified
          
          threadGroups.push({
            name,
            enabled,
            testname: obj['@_testname']
          });
        }
        
        // Recurse through all properties
        Object.values(obj).forEach(value => {
          if (typeof value === 'object') {
            findThreadGroups(value, depth + 1);
          }
        });
      }
    }
    
    findThreadGroups(testPlan);
    
    return threadGroups;
    
  } catch (error) {
    console.error('Error parsing JMX:', error.message);
    return [];
  }
}

module.exports = { parseJMX };
