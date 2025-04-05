/**
 * Mock Clarity session for testing
 * This is a simplified mock that doesn't actually execute Clarity code
 * but simulates the behavior for testing purposes
 */
export function mockClaritySession() {
	// In-memory storage for contract state
	const state = {
		'equipment-registry': {
			equipmentRegistry: {},
			lastEquipmentId: 0
		},
		'farmer-verification': {
			verifiedFarmers: {},
			verificationAuthorities: {},
			contractOwner: 'deployer'
		},
		'usage-scheduling': {
			equipmentSchedule: {}
		},
		'maintenance-tracking': {
			maintenanceRecords: {},
			equipmentMaintenanceCounter: {}
		}
	};
	
	let currentSender = 'deployer';
	
	return {
		deployContract(contractName) {
			console.log(`Deployed contract: ${contractName}`);
			// Contract deployment logic would go here
		},
		
		setTxSender(sender) {
			currentSender = sender;
		},
		
		callPublic(contractName, functionName, args) {
			console.log(`Calling ${contractName}.${functionName} with args:`, args);
			
			// Simulate contract function calls based on contract and function name
			if (contractName === 'equipment-registry') {
				if (functionName === 'register-equipment') {
					const [equipmentType, specifications] = args;
					const newId = state[contractName].lastEquipmentId + 1;
					state[contractName].lastEquipmentId = newId;
					state[contractName].equipmentRegistry[newId] = {
						owner: currentSender,
						equipment_type: equipmentType,
						specifications: specifications,
						is_available: true,
						registration_date: 123 // Mock block height
					};
					return { success: true, value: newId };
				}
				
				if (functionName === 'update-availability') {
					const [equipmentId, isAvailable] = args;
					const equipment = state[contractName].equipmentRegistry[equipmentId];
					
					if (!equipment) {
						return { success: false, error: 1 };
					}
					
					if (equipment.owner !== currentSender) {
						return { success: false, error: 2 };
					}
					
					equipment.is_available = isAvailable;
					return { success: true, value: true };
				}
			}
			
			if (contractName === 'farmer-verification') {
				if (functionName === 'register-authority') {
					const [authority] = args;
					
					if (currentSender !== state[contractName].contractOwner) {
						return { success: false, error: 1 };
					}
					
					state[contractName].verificationAuthorities[authority] = { is_active: true };
					return { success: true, value: true };
				}
				
				if (functionName === 'verify-farmer') {
					const [farmer, farmDetails] = args;
					
					if (!state[contractName].verificationAuthorities[currentSender]) {
						return { success: false, error: 2 };
					}
					
					state[contractName].verifiedFarmers[farmer] = {
						is_verified: true,
						verification_date: 123, // Mock block height
						farm_details: farmDetails
					};
					
					return { success: true, value: true };
				}
				
				if (functionName === 'revoke-verification') {
					const [farmer] = args;
					
					if (!state[contractName].verificationAuthorities[currentSender]) {
						return { success: false, error: 2 };
					}
					
					delete state[contractName].verifiedFarmers[farmer];
					return { success: true, value: true };
				}
			}
			
			// Default fallback
			return { success: false, error: 999 };
		},
		
		callReadOnly(contractName, functionName, args) {
			console.log(`Reading ${contractName}.${functionName} with args:`, args);
			
			if (contractName === 'equipment-registry') {
				if (functionName === 'get-equipment') {
					const [equipmentId] = args;
					const equipment = state[contractName].equipmentRegistry[equipmentId];
					
					if (!equipment) {
						return { value: null };
					}
					
					return { value: equipment };
				}
				
				if (functionName === 'get-equipment-count') {
					return { value: state[contractName].lastEquipmentId };
				}
			}
			
			if (contractName === 'farmer-verification') {
				if (functionName === 'is-verified') {
					const [farmer] = args;
					const farmerData = state[contractName].verifiedFarmers[farmer];
					
					return { value: farmerData ? farmerData.is_verified : false };
				}
				
				if (functionName === 'is-authority') {
					const [authority] = args;
					const authorityData = state[contractName].verificationAuthorities[authority];
					
					return { value: authorityData ? authorityData.is_active : false };
				}
			}
			
			// Default fallback
			return { value: null };
		}
	};
}
