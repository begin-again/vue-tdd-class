import inputValue from './input.vue';
import {render} from '@testing-library/vue';
import "@testing-library/jest-dom";

it('has is-invalid class for input when help is set', () => {
    const {container} = render(inputValue, { props: {help: "error message"}});
    const input = container.querySelector('input');

    expect(input.classList).toContain('is-invalid');
});
it('has invalid-feedback class for span when help is set', () => {
    const {container} = render(inputValue, { props: {help: "error message"}});
    const span = container.querySelector('span');

    expect(span.classList).toContain('invalid-feedback');
});
it('does not have is-invalid class for input when help is not set', () => {
    const {container} = render(inputValue);
    const input = container.querySelector('input');

    expect(input.classList).not.toContain('is-invalid');
});
