const fs = require('fs-extra');
const path = require('path');

/**
 * Modify JMX file to enable/disable thread groups
 * @param {string} jmxPath - Original JMX file path
 * @param {Array} selectedGroups - Array of thread group names to enable
 * @param {string} outputPath - Path to save modified JMX (default: main-mod.jmx)
 * @returns {string} Path to modified JMX file
 */
function modifyJMX(jmxPath, selectedGroups, outputPath = null) {
  try {
    // Read original JMX
    let jmxContent = fs.readFileSync(jmxPath, 'utf-8');
    
    // Parse as XML string (simple regex replacement for enabled attribute)
    // We use regex because it's simpler and preserves XML structure exactly
    
    // Pattern to find ThreadGroup elements with testname
    const threadGroupPattern = /<ThreadGroup[^>]*testname="([^"]*)"[^>]*>/g;
    
    let match;
    const matches = [];
    
    // Find all ThreadGroup elements
    while ((match = threadGroupPattern.exec(jmxContent)) !== null) {
      matches.push({
        fullMatch: match[0],
        testname: match[1],
        index: match.index
      });
    }
    
    // Process matches in reverse order to maintain string indices
    matches.reverse().forEach(({ fullMatch, testname, index }) => {
      const isSelected = selectedGroups.includes(testname);
      
      // Remove existing enabled attribute if present
      let newTag = fullMatch.replace(/\s+enabled="(true|false)"/g, '');
      
      // Add enabled attribute based on selection
      // Insert before the closing >
      newTag = newTag.replace(/>$/, ` enabled="${isSelected}">`);
      
      // Replace in content
      jmxContent = jmxContent.substring(0, index) + newTag + jmxContent.substring(index + fullMatch.length);
    });
    
    // Determine output path
    if (!outputPath) {
      const dir = path.dirname(jmxPath);
      const basename = path.basename(jmxPath, '.jmx');
      outputPath = path.join(dir, `${basename}-mod.jmx`);
    }
    
    // Write modified JMX
    fs.writeFileSync(outputPath, jmxContent, 'utf-8');
    
    return outputPath;
    
  } catch (error) {
    console.error('Error modifying JMX:', error.message);
    throw error;
  }
}

module.exports = { modifyJMX };
