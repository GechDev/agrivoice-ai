<?php

use App\Models\Agent;
use Inertia\Testing\AssertableInertia;

beforeEach(function (): void {
    $this->agent = Agent::factory()->create([
        'name' => 'Gezachew',
        'pin' => '2222',
    ]);
});

test('the sign-in screen offers the seeded agent roster', function () {
    Agent::factory()->create(['name' => 'Nati']);

    $this->get(route('portal.login'))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('portal/login')
            ->where('agentNames', ['Gezachew', 'Nati']),
        );
});

test('an agent signs in with their name and PIN', function () {
    $response = $this->post(route('portal.login.store'), [
        'name' => 'Gezachew',
        'pin' => '2222',
    ]);

    $response->assertRedirect(route('portal.entry'));
    expect(session('agent_id'))->toBe($this->agent->id);
});

test('a surrounding space in the name does not block sign-in', function () {
    $this->post(route('portal.login.store'), [
        'name' => '  Gezachew  ',
        'pin' => '2222',
    ])->assertRedirect(route('portal.entry'));

    expect(session('agent_id'))->toBe($this->agent->id);
});

test('the wrong PIN is rejected without starting a session', function () {
    $this->post(route('portal.login.store'), [
        'name' => 'Gezachew',
        'pin' => '9999',
    ])->assertSessionHasErrors('pin');

    expect(session('agent_id'))->toBeNull();
});

test('an unknown agent name is rejected the same way as a wrong PIN', function () {
    $this->post(route('portal.login.store'), [
        'name' => 'Nobody',
        'pin' => '2222',
    ])->assertSessionHasErrors('pin');

    expect(session('agent_id'))->toBeNull();
});

test('the PIN has to be four digits', function (string $pin) {
    $this->post(route('portal.login.store'), [
        'name' => 'Gezachew',
        'pin' => $pin,
    ])->assertSessionHasErrors('pin');

    expect(session('agent_id'))->toBeNull();
})->with([
    'too short' => ['22'],
    'too long' => ['22222'],
    'not digits' => ['abcd'],
    'empty' => [''],
]);

test('the entry portal is closed to visitors without a session', function () {
    $this->get(route('portal.entry'))->assertRedirect(route('portal.login'));
});

test('a stale session pointing at a deleted agent is turned away', function () {
    $this->withSession(['agent_id' => $this->agent->id]);
    $this->agent->delete();

    $this->get(route('portal.entry'))->assertRedirect(route('portal.login'));
});

test('a signed-in agent skips the sign-in screen', function () {
    $this->withSession(['agent_id' => $this->agent->id])
        ->get(route('portal.login'))
        ->assertRedirect(route('portal.entry'));
});

test('signing out clears the agent from the session', function () {
    $this->withSession(['agent_id' => $this->agent->id])
        ->post(route('portal.logout'))
        ->assertRedirect(route('portal.login'));

    expect(session('agent_id'))->toBeNull();
});

test('an api client without a session is refused rather than redirected', function () {
    $this->postJson(route('reports.store'))->assertUnauthorized();
});
