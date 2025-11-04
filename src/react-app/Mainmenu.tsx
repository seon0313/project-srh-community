import styles from "./Mainmenu.module.css";
import { useNavigate } from "react-router-dom";
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import Topbar from "./Topbar";
import { onImgError, onImgLoad, getSafeImageSrc } from "./utils/imageFallback";
import { usePresence } from "./utils/presence";

type FeedPost = {
	id: string;
	type: string;
	category: string;
	author: string;
	author_id: string;
	thumbnail_url: string;
	title: string;
	content: string;
	upload_time: number | string;
	edited: number;
	state: string;
};

type NoticePost = {
	id: number | string;
	title: string;
	author: string;
	date: string;
};

type Guide = {
	id: string;
	title: string;
	description: string;
	author_id: string;
	needtime: number;
	step: number;
	thumbnail_url: string;
};

const AUTO_SCROLL_INTERVAL = 1200;

function Mainmenu() {
	const navigate = useNavigate();
	const [posts, setPosts] = useState<FeedPost[]>([]);
	const [noticePosts, setNoticePosts] = useState<NoticePost[]>([]);
	const [guides, setGuides] = useState<Guide[]>([]);
	const [banners, setBanners] = useState<string[]>([]);
	const [loadedBanners, setLoadedBanners] = useState<Record<string, boolean>>({});
	const [loading, setLoading] = useState(true);
	const [guidesLoading, setGuidesLoading] = useState(true);
	const [bannersLoading, setBannersLoading] = useState(true);
	const [isFriendsOpen, setFriendsOpen] = useState(false);

	const sliderRef = useRef<HTMLDivElement | null>(null);
	const pausedRef = useRef(false);
	const intervalRef = useRef<number | null>(null);
	const offsetRef = useRef(0);
	const initializedRef = useRef(false);
	const isAnimatingRef = useRef(false);
	const pausedMonitorRef = useRef<number | null>(null);
	const scrollOnceRef = useRef<() => void>(() => {});

	const token = useMemo(
		() => (typeof window !== "undefined" ? localStorage.getItem("token") ?? undefined : undefined),
		[]
	);
	const { onlineList } = usePresence(token);

	const visibleFriends = useMemo(() => onlineList.slice(0, 8), [onlineList]);

	const friendsListMarkup = visibleFriends.length === 0 ? (
		<div className={styles.emptyFriends}>온라인 유저가 없습니다.</div>
	) : (
		<div className={styles.businessCardList}>
			{visibleFriends.map((user, index) => (
				<div
					key={user.id}
					className={styles.businessCard}
					style={{ "--item-index": index } as CSSProperties}
					onClick={() => navigate(`/user/${user.username || user.id}`)}
				>
					<div className={styles.cardHeader}>
						<img src="/vite.svg" alt={user.username || user.id} className={styles.cardAvatar} />
						<div className={styles.cardInfo}>
							<h4 className={styles.cardName}>{user.username || user.id}</h4>
						</div>
						<div
							className={`${styles.onlineStatus} ${
								user.status === "online" ? styles.online : styles.offline
							}`}
						></div>
					</div>
				</div>
			))}
		</div>
	);

	const formatDate = (value: number | string) => {
		const date = new Date(value);
		if (Number.isNaN(date.getTime())) return String(value);
		return date.toLocaleDateString();
	};

	const startPausedMonitor = () => {
		if (pausedMonitorRef.current != null) return;
		const loop = () => {
			const slider = sliderRef.current;
			if (!slider) return;
			const container = slider.parentElement as HTMLElement | null;
			const firstEl = slider.firstElementChild as HTMLElement | null;
			if (container && firstEl) {
				if (isAnimatingRef.current) {
					pausedMonitorRef.current = window.requestAnimationFrame(loop);
					return;
				}
				const containerRect = container.getBoundingClientRect();
				const firstRect = firstEl.getBoundingClientRect();
				if (firstRect.right <= containerRect.left + 1) {
					let gap = 0;
					if (slider.children.length > 1) {
						const second = slider.children[1] as HTMLElement;
						gap = second.offsetLeft - (firstEl.offsetLeft + firstEl.offsetWidth);
						if (!Number.isFinite(gap) || gap < 0) gap = 0;
					}
					const slideStep = firstEl.offsetWidth + gap;
					slider.appendChild(firstEl);
					offsetRef.current += slideStep;
					slider.style.transition = "none";
					void slider.offsetHeight;
					slider.style.transform = `translateX(${offsetRef.current}px)`;
					setBanners(prev => {
						if (prev.length === 0) return prev;
						const [first, ...rest] = prev;
						return [...rest, first];
					});
				}
			}

			pausedMonitorRef.current = window.requestAnimationFrame(loop);
		};
		pausedMonitorRef.current = window.requestAnimationFrame(loop);
	};

	const stopPausedMonitor = () => {
		if (pausedMonitorRef.current != null) {
			window.cancelAnimationFrame(pausedMonitorRef.current);
			pausedMonitorRef.current = null;
		}
	};

	const startAutoScroll = () => {
		if (intervalRef.current != null) {
			window.clearInterval(intervalRef.current);
			intervalRef.current = null;
		}
		pausedRef.current = false;
		stopPausedMonitor();
		intervalRef.current = window.setInterval(() => {
			try {
				scrollOnceRef.current();
			} catch {
				// ignore
			}
		}, AUTO_SCROLL_INTERVAL);
	};

	const stopAutoScroll = () => {
		if (intervalRef.current != null) {
			window.clearInterval(intervalRef.current);
			intervalRef.current = null;
		}
	};

	const centerChildAtIndex = (index: number, onComplete?: () => void) => {
		const slider = sliderRef.current;
		if (!slider) return;
		const child = slider.children[index] as HTMLElement | undefined;
		if (!child) return;
		const container = slider.parentElement as HTMLElement;
		if (!container) return;

		const slideWidth = child.offsetWidth;
		const childOffsetLeft = child.offsetLeft;
		const newOffset = (container.clientWidth - slideWidth) / 2 - childOffsetLeft;

		slider.style.transition = "transform 500ms cubic-bezier(0.4,0,0.2,1)";
		offsetRef.current = newOffset;
		isAnimatingRef.current = true;
		slider.style.transform = `translateX(${newOffset}px)`;

		const onEnd = () => {
			slider.removeEventListener("transitionend", onEnd);
			isAnimatingRef.current = false;
			if (onComplete) onComplete();
		};
		slider.addEventListener("transitionend", onEnd);
	};

	useEffect(() => {
		fetch("/api/notice-posts", { method: "POST" })
			.then(res => res.json())
			.then((data: NoticePost[]) => setNoticePosts(data))
			.catch(() => setNoticePosts([]));

		fetch("/api/posts")
			.then(res => res.json())
			.then((data: FeedPost[]) => {
				setPosts(data);
				setLoading(false);
			})
			.catch(() => setLoading(false));

		fetch("/api/guides")
			.then(res => res.json())
			.then((data: Guide[]) => {
				setGuides(data);
				setGuidesLoading(false);
			})
			.catch(() => setGuidesLoading(false));

		fetch("/api/banners?count=10")
			.then(res => res.json())
			.then((data: { banners?: string[] }) => {
				setBanners(data.banners ?? []);
				setBannersLoading(false);
			})
			.catch(() => setBannersLoading(false));
	}, []);

	useEffect(() => {
		if (banners.length === 0) return;

		isAnimatingRef.current = isAnimatingRef.current || false;

		if (!initializedRef.current) {
			const sliderEl = sliderRef.current;
			if (sliderEl) {
				const firstChild = sliderEl.children[0] as HTMLElement | undefined;
				let centerOffset = 0;
				if (firstChild) {
					const slideWidth = firstChild.offsetWidth;
					const container = sliderEl.parentElement as HTMLElement;
					centerOffset = (container.clientWidth - slideWidth) / 2;
					sliderEl.style.transition = "none";
					sliderEl.style.transform = `translateX(${centerOffset}px)`;
				}
				offsetRef.current = centerOffset;
				initializedRef.current = true;
			}
		}

		const handleResize = () => {
			const slider = sliderRef.current;
			if (!slider) return;
			const container = slider.parentElement as HTMLElement;
			if (!container) return;

			const containerRect = container.getBoundingClientRect();
			const containerCenterX = containerRect.left + container.clientWidth / 2;

			let closestChild: HTMLElement | null = null;
			let closestDist = Infinity;
			for (let i = 0; i < slider.children.length; i++) {
				const child = slider.children[i] as HTMLElement;
				const rect = child.getBoundingClientRect();
				const childCenter = rect.left + rect.width / 2;
				const dist = Math.abs(childCenter - containerCenterX);
				if (dist < closestDist) {
					closestDist = dist;
					closestChild = child;
				}
			}

			if (!closestChild) return;

			const slideWidth = closestChild.offsetWidth;
			const childOffsetLeft = closestChild.offsetLeft;
			const newOffset = (container.clientWidth - slideWidth) / 2 - childOffsetLeft;

			offsetRef.current = newOffset;
			slider.style.transition = "none";
			slider.style.transform = `translateX(${newOffset}px)`;
			void slider.offsetHeight;
		};

		window.addEventListener("resize", handleResize);

		const scrollOnce = () => {
			if (pausedRef.current) return;
			if (!sliderRef.current || isAnimatingRef.current) return;
			const slider = sliderRef.current;
			const firstChild = slider.children[0] as HTMLElement | undefined;
			if (!firstChild) return;

			let gap = 0;
			if (slider.children.length > 1) {
				const second = slider.children[1] as HTMLElement;
				gap = second.offsetLeft - (firstChild.offsetLeft + firstChild.offsetWidth);
				if (!Number.isFinite(gap) || gap < 0) gap = 0;
			}

			const slideWidth = firstChild.offsetWidth;
			const slideStep = slideWidth + gap;
			isAnimatingRef.current = true;

			slider.style.transition = "transform 700ms cubic-bezier(0.4,0,0.2,1)";
			offsetRef.current -= slideStep;
			slider.style.transform = `translateX(${offsetRef.current}px)`;

			const onTransitionEnd = () => {
				slider.removeEventListener("transitionend", onTransitionEnd);
				const container = slider.parentElement as HTMLElement;
				const firstEl = slider.firstElementChild as HTMLElement | null;
				const containerRect = container.getBoundingClientRect();
				const firstRect = firstEl ? firstEl.getBoundingClientRect() : null;
				const fullyOut = firstRect ? firstRect.right <= containerRect.left + 1 : false;

				if (fullyOut && firstEl) {
					slider.appendChild(firstEl);
					offsetRef.current += slideStep;
					slider.style.transition = "none";
					void slider.offsetHeight;
					slider.style.transform = `translateX(${offsetRef.current}px)`;

					requestAnimationFrame(() => {
						setBanners(prev => {
							if (prev.length === 0) return prev;
							const [first, ...rest] = prev;
							return [...rest, first];
						});
						requestAnimationFrame(() => {
							isAnimatingRef.current = false;
						});
					});
				} else {
					slider.style.transition = "none";
					void slider.offsetHeight;
					slider.style.transform = `translateX(${offsetRef.current}px)`;
					requestAnimationFrame(() => {
						isAnimatingRef.current = false;
					});
				}
			};

			slider.addEventListener("transitionend", onTransitionEnd);
		};

		scrollOnceRef.current = scrollOnce;
		startAutoScroll();

		return () => {
			stopAutoScroll();
			window.removeEventListener("resize", handleResize);
			stopPausedMonitor();
		};
	}, [banners]);

	return (
		<div className={styles.Mainmenu}>
			<Topbar />

			{!bannersLoading && banners.length > 0 ? (
				<div className={styles.bannerContainer} tabIndex={0}>
					<div className={styles.bannerSlider} ref={sliderRef}>
						{banners.map((banner, index) => (
							<div key={banner} className={styles.bannerItem}>
								<img
									src={banner}
									className={styles.bannerImage}
									tabIndex={0}
									onMouseEnter={() => {
										const container = sliderRef.current?.parentElement as HTMLElement | null;
										if (container) container.style.overflow = "visible";
										pausedRef.current = true;
										stopAutoScroll();
										startPausedMonitor();
									}}
									onMouseLeave={() => {
										const container = sliderRef.current?.parentElement as HTMLElement | null;
										if (container) container.style.overflow = "";
										startAutoScroll();
									}}
									onFocus={() => {
										pausedRef.current = true;
										const container = sliderRef.current?.parentElement as HTMLElement | null;
										if (container) container.style.overflow = "visible";
										centerChildAtIndex(index, () => startPausedMonitor());
									}}
									onBlur={() => {
										const container = sliderRef.current?.parentElement as HTMLElement | null;
										if (container) container.style.overflow = "";
										startAutoScroll();
									}}
									onClick={event => {
										const img = event.currentTarget;
										if (document.activeElement !== img) {
											img.focus();
											pausedRef.current = true;
											stopAutoScroll();
											const container = sliderRef.current?.parentElement as HTMLElement | null;
											if (container) container.style.overflow = "visible";
											centerChildAtIndex(index, () => startPausedMonitor());
										}
									}}
									onLoad={() => setLoadedBanners(prev => ({ ...prev, [banner]: true }))}
									onError={() => setLoadedBanners(prev => ({ ...prev, [banner]: true }))}
								/>
								{!loadedBanners[banner] && (
									<div className={styles.bannerSpinnerOverlay}>
										<div className={styles.loadingSpinner}></div>
									</div>
								)}
							</div>
						))}
					</div>
				</div>
			) : (
				<div className={styles.bannerContainer}>
					<div className={styles.bannerLoading}>
						<div className={styles.loadingSpinner}></div>
					</div>
				</div>
			)}

			<button
				type="button"
				className={styles.friendsToggleButton}
				aria-controls="friends-drawer"
				aria-expanded={isFriendsOpen}
				onClick={() => setFriendsOpen(value => !value)}
			>
				프렌즈 열기
			</button>

			<div
				className={`${styles.drawerOverlay} ${isFriendsOpen ? styles.open : ""}`}
				onClick={() => setFriendsOpen(false)}
				aria-hidden={!isFriendsOpen}
			/>

			<aside
				id="friends-drawer"
				className={`${styles.friendsDrawer} ${isFriendsOpen ? styles.open : ""}`}
				role="dialog"
				aria-label="로봇고 프렌즈"
			>
				<div className={styles.friendsDrawerHeader}>
					<strong>로봇고 프렌즈</strong>
					<button
						type="button"
						className={styles.closeButton}
						onClick={() => setFriendsOpen(false)}
						aria-label="닫기"
					>
						×
					</button>
				</div>
				<div className={styles.friendsDrawerBody}>{friendsListMarkup}</div>
			</aside>

			<div className={styles.main}>
				<div className={`${styles.mainItem} ${styles.infoPanel}`}>
					{guidesLoading ? (
						<div className={styles.guideLoadingSpace}>
							<div className={styles.loadingSpinner}></div>
						</div>
					) : (
						<div className={styles.guideList}>
							{guides.slice(0, 5).map((guide, index) => (
								<div
									key={guide.id}
									className={styles.guideItem}
									style={{ "--item-index": index } as CSSProperties}
									onClick={() => navigate(`/guide/${guide.id}`)}
								>
									<img
										src={getSafeImageSrc(guide.thumbnail_url)}
										alt={guide.title}
										className={styles.guideThumbnail}
										onError={onImgError}
										onLoad={onImgLoad}
									/>
									<div className={styles.guideContent}>
										<h4 className={styles.guideTitle}>{guide.title}</h4>
										<p className={styles.guideDescription}>{guide.description}</p>
										<div className={styles.guideMeta}>
											<span className={styles.guideAuthor}>{guide.author_id}</span>
											<span className={styles.guideTime}>{guide.needtime}분</span>
											<span className={styles.guideSteps}>{guide.step}단계</span>
										</div>
									</div>
								</div>
							))}
							<div className={styles.moreButtonContainer}>
								<div className={styles.moreButton} onClick={() => navigate("/guides")}>
									<p>더보기</p>
								</div>
							</div>
						</div>
					)}
				</div>

				<div className={`${styles.mainItem} ${styles.contentPanel}`}>
					<table className={styles.posttable}>
						<tbody>
							{loading ? (
								<tr>
									<td colSpan={3} className={styles.loadingSpace}>
										<div className={styles.loadingSpinner}></div>
									</td>
								</tr>
							) : (
								<>
									{noticePosts.map((notice, index) => (
										<tr
											key={`notice-${notice.id}`}
											className={`${styles.postitem} ${styles.noticePost}`}
											style={{ "--item-index": index } as CSSProperties}
											onClick={() => navigate(`/post/${notice.id}`)}
										>
											<td className={styles.postTitle}>
												<strong>{notice.title}</strong>
											</td>
											<td
												className={styles.postAuthor}
												onClick={event => {
													event.stopPropagation();
													navigate(`/user/${notice.author}`);
												}}
											>
												<strong>{notice.author}</strong>
											</td>
											<td className={styles.postDate}>
												<strong>{notice.date}</strong>
											</td>
										</tr>
									))}
									{posts.map((post, index) => (
										<tr
											key={post.id}
											className={styles.postitem}
											style={{ "--item-index": noticePosts.length + index } as CSSProperties}
											onClick={() => navigate(`/post/${post.id}`)}
										>
											<td className={styles.postTitle}>
												<strong>{post.title}</strong>
											</td>
											<td
												className={styles.postAuthor}
												onClick={event => {
													event.stopPropagation();
													navigate(`/user/${post.author}`);
												}}
											>
												<strong>{post.author}</strong>
											</td>
											<td className={styles.postDate}>
												<strong>{formatDate(post.upload_time)}</strong>
											</td>
										</tr>
									))}
								</>
							)}
							<tr className={styles.moreButtonContainer}>
								<td colSpan={3} className={styles.moreButton} onClick={() => navigate("/posts")}>
									<p>더보기</p>
								</td>
							</tr>
						</tbody>
					</table>
				</div>
				<div className={`${styles.mainItem} ${styles.friendsPanel}`}>
					<div className={styles.friendsDrawerHeader}>
						<strong>로봇고 프렌즈</strong>
						<span className={styles.friendsCount}>
							{onlineList.length > 0
								? onlineList.length > 99
									? "99+명 온라인"
									: `${onlineList.length}명 온라인`
								: "현재 접속자 없음"}
						</span>
					</div>
					<div className={styles.friendsDrawerBody}>{friendsListMarkup}</div>
				</div>
			</div>
		</div>
	);
}

export default Mainmenu;
