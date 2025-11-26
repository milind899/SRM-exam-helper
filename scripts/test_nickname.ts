import { validateNickname } from '../src/utils/nicknameValidator';

const testCases = [
    'boo8s',
    'b00bs',
    'milind',
    'validName',
    'bad word',
    't!ts',
    'chutiya',
    'chut!ya',
    'g@ndu',
    'l0da',
    'b.o.o.b.s',
    'h!jra'
];

console.log('Testing Nickname Validator:');
testCases.forEach(name => {
    const result = validateNickname(name);
    console.log(`"${name}": ${result.valid ? 'VALID' : 'INVALID'} - ${result.error || ''}`);
});
