"use client";
import React from "react";
import {
	motion,
	useAnimationFrame,
	useMotionTemplate,
	useMotionValue,
	useTransform,
} from "motion/react";
import { useRef } from "react";
import { cn } from "@/lib/utils";

export function MovingBorderButton({
	borderRadius = "1.75rem",
	children,
	as: Component = "button",
	containerClassName,
	borderClassName,
	duration,
	className,
	...otherProps
}: {
	borderRadius?: string;
	children: React.ReactNode;
	as?: any;
	containerClassName?: string;
	borderClassName?: string;
	duration?: number;
	className?: string;
	[key: string]: any;
}) {
	return (
		<Component
			className={cn(
				"relative h-10 lg:h-11 w-56 overflow-hidden bg-transparent p-[1px] text-xl hidden sm:flex",
				containerClassName
			)}
			style={{
				borderRadius: borderRadius,
			}}
			{...otherProps}
		>
			<div
				className="absolute inset-0"
				style={{ borderRadius: `calc(${borderRadius} * 0.96)` }}
			>
				<MovingBorder duration={duration} rx="30%" ry="30%">
					<div
						className={cn(
							"h-20 w-20 bg-[radial-gradient(#0ea5e9_40%,transparent_80%)] opacity-[0.9",
							"bg-[radial-gradient(#34d399_40%,transparent_90%)] opacity-[0.4]",
							borderClassName
						)}
					/>
				</MovingBorder>
			</div>

			<div
				className={cn(
					"relative flex h-full w-full items-center justify-center border border-l-1 bg-white/50 dark:bg-white/20 text-sm antialiased backdrop-blur-3xl dark:backdrop-blur-5xl",
					className
				)}
				style={{
					borderRadius: `calc(${borderRadius} * 0.96)`,
				}}
			>
				{children}
			</div>
		</Component>
	);
}

export const MovingBorder = ({
	children,
	duration = 3000,
	rx,
	ry,
	...otherProps
}: {
	children: React.ReactNode;
	duration?: number;
	rx?: string;
	ry?: string;
	[key: string]: any;
}) => {
	const pathRef = useRef<SVGPathElement>(null);
	const progress = useMotionValue<number>(0);

	useAnimationFrame(time => {
		const length = pathRef.current?.getTotalLength();
		if (length) {
			const pxPerMillisecond = length / duration;
			progress.set((time * pxPerMillisecond) % length);
		}
	});

	const x = useTransform(
		progress,
		val => pathRef?.current?.getPointAtLength(val)?.x || 0
	);
	const y = useTransform(
		progress,
		val => pathRef?.current?.getPointAtLength(val)?.y || 0
	);

	const transform = useMotionTemplate`translateX(${x}px) translateY(${y}px) translateX(-50%) translateY(-50%)`;

	return (
		<>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				preserveAspectRatio="none"
				className="absolute h-full w-full"
				width="100%"
				height="100%"
				viewBox="0 0 100 100"
				{...otherProps}
			>
				<path
					fill="none"
					stroke="none"
					d="M 10,0 L 90,0 Q 100,0 100,10 L 100,90 Q 100,100 90,100 L 10,100 Q 0,100 0,90 L 0,10 Q 0,0 10,0 Z"
					ref={pathRef}
				/>
			</svg>
			<motion.div
				style={{
					position: "absolute",
					top: 0,
					left: 0,
					display: "inline-block",
					transform,
				}}
			>
				{children}
			</motion.div>
		</>
	);
};
