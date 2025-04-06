---
title: Making a Mover
description: How to actually make a Character with the Mover Component
---

We're going to actually move through the steps of making a Pawn into a Character with the Mover Component.

> This project will be described from the perspective of starting with the Third Person Template, you may need to do slightly different steps in your own project.

## Step 0: Plugins and Settings

Some setup is required before we can even use the Mover Component.

### Enable the Mover Plugin

Enable the Mover plugin in your project, by doing the following:

1. Open the Plugin panel by selecting **Edit > Plugins**.
2. In the Plugin panel, input `Mover` into the **search** bar.
3. Enable the **Mover** plugin and, optionally, the **Mover Examples** plugin.
4. **Restart** Unreal Editor.

### Adjust Project Settings
Make the following adjustments to your project settings:

1. Open the Project Settings panel by selecting **Edit > Project Settings**.
2. Select the **Network Prediction** filter under the Project heading or use the search bar to find the following settings and adjust their values:
3. Set **Preferred Ticking Policy** to *Fixed*.
4. Set **Simulated Proxy Network LOD** to *Interpolated*.
5. Set **Enable Fixed Tick Smoothing** to *True*.

These settings are recommended by Epic Games for general use cases.

## Step 1: Create a New Pawn with the Mover Component

Create a new **Blueprint Class** with **Pawn** as the parent class.

Here, if you have an existing `Character` you are hoping to mirror, you can copy over their `Scene Components` to the Pawn as a starting point.

We end up here with something like this:

You'll want to set the base **Class Defaults* setting for `Replicate Movement` to `False`. The Mover Component will handle the replication and we don't want conflicts.

You should also set the `SpringArm` component to `Use Pawn Control Rotation` to `True` so the camera will follow the control rotation. This will ensure "up" is always "forward" from the camera's perspective.

You may also want to adjust your game mode to use this new `Pawn` as the *default* Pawn class so you can test as we go.

In the **Components** panel, add a the **CharacterMover** component.

> We are using the `CharacterMover` component here, but you can use the `Mover` component if you want to build a more generic pawn. You'll then skip over certain behaviors related to jumping.

If you play the game now, your pawn should spawn and fall to the ground and do nothing else.

*Perfect!*

## Step 2: Implement `MoverInputProducerInterface`

You'll need to add the `MoverInputProducerInterface` to your Pawn's **Implemented Interfaces** in the **Class Settings** panel.

This consists of one function, `ProduceInput`, which is called by the Mover Component to get the inputs from the player.

### ProduceInput

`ProduceInput` is called before the simulation step, and should only be called in the client.

Params:
- `SimTimeMs<Integer>`: The time since the last simulation step, in milliseconds.

Returns:
- `InputCmdResult<MoverInputCmdContext>`: The result of the input command.

> This implementation is based on the `MoverExampleCharacter` class in the Mover Examples plugin, which is implemented in C++. This will be presented as a Blueprint implementation for others to more easily follow along.

#### Handle Uncontrolled Pawns
If the `Pawn` is not relevant to this client, you should return nothing. But if the `Pawn` is relevant (client has authority) but not locally controlled, you should return the default `MoverInputCmdContext` to pass in nothing inputs.

<!-- Insert Blueprint -->

#### Test Movement

The way the output works is that all the different inputs are put into a collection and the mover combines all of their intents together. So you can collect inputs and forces from many different sources and let the Mover Component handle the rest.

To test this, lets have the locally controlled pawn move forward.

We can do mostly the same thing as we did for a "Do Nothing" kind of output, but on the `DefaultInput` we can set the `MoveInputType` to `DirectionalIntent` and set the `x` value to `1.0` to move forward.

<!-- Insert Blueprint -->

Now if we play the game, our pawn should fall to the ground and move forward until it hits something.

*Fantastic!*

From here, you can probably think up ways to build these inputs already, and you can head off and do that if you want.

But lets continue implementing the `ProduceInput` method like how the example character does it.

#### Adjust Input Control Rotation

In our main branch (when locally controlled), we will want to make a local variable that is a `CharacterDefaultInputs` struct. So we can modify it as we go and then return it properly at the end.

Then we will want to get the `ControlRotation` of the `PlayerController` and set that to the `ControlRotation` of the `CharacterDefaultInputs` struct.

<!-- Insert Blueprint -->

#### Convert Cached Movements To Directional Intent

We will want to create new variables on our `Pawn` to take in different movement inputs (from player controls or outside stimuli) and convert them to intends that the Mover can understand.

- `CachedMovementIntent`: `Vector`
- `CachedVelocity`: `Vector`

For now these will always be zeroed out, but we will use inputs from the player to set them later.

First, we check if the `CachedVelocity` is zero (or not, your pick). If it is not zero, our job is pretty easy, we can just set the `MoveInputType` to `Velocity` and set `MoveInput` to the `CachedVelocity` value.

But if it *is* zero, we need to instead use the `CachedMovementIntent` value.

The basic flow here is that we need to rotate the movement to move the character "forward" and not simply along the world axis.

So the first thing we can do is take the `CachedMovementIntent` and rotate it by the `ControlRotation` of the `CharacterInput`. We then set this to the `MoveInput` value and set the `MoveInputType` to `DirectionalIntent`.

But there is another concern. If the camera is pointed downward or upward, we could "lose" some movement intent on the `Z` axis, while also trying ot push into the ground or up into the air, hopefully to then be cancelled by the ground and gravity, respectively. But we would be losing some of the `X` and `Y` intent.

To handle this, we can check if either the character `IsOnGround` *OR* `IsFalling` (from the `CharacterMover`), and if so, we do some fancy math to eliminate the `Z` impacts and renormalize the `X` and `Y` values. You can just look at the blueprint.

<!-- Insert Blueprint -->

#### Testing Movement

Now that we have the `ProduceInput` method working at a basic level, we need to actually have some inputs to test with.

> For this guide, I'll do a very basic direct WASD input system. You should use EnhancedInput, or whatever the heck you would normally use, but we're gonna keep it simple/broken here to demo.

<!-- Insert Blueprint -->

And now we move around! Fantastic!

Now let's look around.

> This is a simple mapping for the mouse movement, you can do your own thing for controller inputs.

Try moving around and looking around. You should be able to move around the world and direct your pawn in the direction you are looking.

<!-- Insert Blueprint -->

> If your movement appears jittery, you should ensure that the `SpringArm` component is a child of the `SkeletalMesh` component, and not the `RootComponent`. The capsule itself will move in a `jittery` manner, but our character will move smoothly.

#### Orient Pawn to Movement (or Camera)

Now, we just need to fix the issue of the pawn rotation. We'll implement a kind of normal third person situation, where the pawn rotates to face the direction of movement, with a toggle to switch to camera facing, but only when the character is moving. If the character is not moving, we just want the camera to orbit and the pawn to stay in place.

So, let's add a variables to our `Pawn`:
- `OrientToMovement`: `Boolean`

So first, let's check if the `Pawn` is moving (has a `MoveInput` with a length), and if it is we can go into our Orientation logic, where we can check if the `OrientToMovement` is true or false, and set the `OrientationIntent` to either the direction of movement, or the camera direction.

<!-- Insert Blueprint -->

Now we're getting somewhere!

But wait, why does the character lay down when we look down and up?

#### Canceling Vertical Rotation

For these kinds of typical games, we normally don't want the character free rotating Up and down. Some games we might, or we might during certain abilities (and movement modes), so we can add a variable to control if we should remain upright or not:

- `RemainUpright`: `Boolean`

<!-- Insert Blueprint -->

> We might in other guides on movement modes and modifier demonstrate this implemented in a more complex way, but for now we will use a boolean on the `Pawn`.

#### Completing Partial Turns

One issue remains. Try this: Set `OrientToMotion` to `true`, stand still, quickly tap motion in a direction that isn't "forward" for the `Pawn`. You'll see the character do just a partial turn in that direction.

So, how can we ensure it completes the turn? Well, we can cash the last `OrientationIntent` and reuse it is the `Pawn` doesn't have a new `MoveInput` value.

Let's use one variable to control this and another to cache the last orientation:

- `MaintainLastOrientation`: `Boolean`
- `LastOrientation`: `Vector`

<!-- Insert Blueprint -->

#### Handle Jumping

Now let's add a jump input and handle that logic in our `ProduceInput` method.

To do this, the `CharacterMover` has two properties on the `CharacterDefaultInputs` struct that we can use to handle jumping:
- `IsJumpPressed`: `Boolean` - Is the button being held down?
- `IsJumpJustPressed`: `Boolean` - Was the button pressed down this frame?

An easy way to handle this is to mirror these variables in our `Pawn` class, and then set them in the `ProduceInput` method.
- `JumpPressed`: `Boolean`
- `JumpJustPressed`: `Boolean`

<!-- Insert Blueprint -->

And now we set them to the inputs in the `ProduceInput` method.

<!-- Insert Blueprint -->

> It's important to reset the `JumpJustPressed` variable to `false` at the end of the frame, so it doesn't get stuck in a freshly pressed state.

## Step 3: Profit?

That's it! You've now for a working Mover based `Pawn` that can move around the world and jump.

## Further reading

- Read about the [Mover Examples](https://dev.epicgames.com/documentation/en-us/unreal-engine/mover-examples-in-unreal-engine) in the Unreal Docs
