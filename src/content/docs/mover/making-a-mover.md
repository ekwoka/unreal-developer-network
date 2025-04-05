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

You'll want to set the base **Class Defaults* setting for `Replicate Movement` to `False`. The Mover Component will handle the replication and we don't want conflicts.

You may also want to adjust your game mode to use this new `Pawn` as the *default* Pawn class so you can test as we go.

In the **Components** panel, add a the **CharacterMover** component.


If you play the game now, your pawn should span and fall to the ground and do nothing else.

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

## Further reading

- Read about the [Mover Examples](https://dev.epicgames.com/documentation/en-us/unreal-engine/mover-examples-in-unreal-engine) in the Unreal Docs
