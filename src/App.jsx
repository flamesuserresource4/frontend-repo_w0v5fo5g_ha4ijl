import { useEffect, useState } from 'react'
import { Home, Search, Play, ShoppingBag, User as UserIcon, Heart, Camera } from 'lucide-react'
import Spline from '@splinetool/react-spline'

const API_BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

function TopBar() {
  return (
    <div className="sticky top-0 z-20 bg-white/80 backdrop-blur border-b border-gray-200">
      <div className="max-w-3xl mx-auto flex items-center justify-between h-14 px-4">
        <div className="text-xl font-semibold">AIgram</div>
        <div className="flex items-center gap-4">
          <Camera size={22} />
          <Heart size={22} />
        </div>
      </div>
    </div>
  )
}

function BottomNav({ tab, setTab }) {
  const Item = ({ id, icon: Icon }) => (
    <button onClick={() => setTab(id)} className={`flex-1 flex items-center justify-center py-2 ${tab===id? 'text-black' : 'text-gray-400'}`}>
      <Icon size={24} />
    </button>
  )
  return (
    <div className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 h-14 flex max-w-3xl mx-auto">
      <Item id="home" icon={Home} />
      <Item id="search" icon={Search} />
      <Item id="reels" icon={Play} />
      <Item id="shop" icon={ShoppingBag} />
      <Item id="profile" icon={UserIcon} />
    </div>
  )
}

function Stories({ stories }) {
  return (
    <div className="border-b border-gray-200 py-3">
      <div className="flex gap-3 overflow-x-auto px-3 no-scrollbar">
        {stories.map((s) => (
          <div key={s._id} className="flex flex-col items-center">
            <img src={s.author?.avatar_url} alt="" className="w-16 h-16 rounded-full ring-2 ring-pink-500 object-cover" />
            <span className="text-xs mt-1 text-gray-600">{s.author?.username}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function PostCard({ post, onLike }) {
  const [liked, setLiked] = useState(false)
  return (
    <div className="border-b border-gray-200">
      <div className="flex items-center gap-3 px-3 py-2">
        <img src={post.author?.avatar_url} className="w-8 h-8 rounded-full object-cover" />
        <div className="text-sm font-medium">{post.author?.username}</div>
      </div>
      <div className="bg-black">
        <img src={post.media_url} className="w-full object-cover" />
      </div>
      <div className="px-3 py-2 flex items-center gap-4">
        <button onClick={() => { setLiked(true); onLike?.(post._id) }} className={`p-1 ${liked? 'text-pink-600': ''}`}><Heart fill={liked? 'currentColor': 'none'} /></button>
      </div>
      <div className="px-3 pb-3">
        <div className="text-sm font-semibold">{post.like_count} likes</div>
        {post.caption && <div className="text-sm mt-1"><span className="font-semibold mr-1">{post.author?.username}</span>{post.caption}</div>}
      </div>
    </div>
  )
}

function HomeFeed() {
  const [feed, setFeed] = useState([])
  const [stories, setStories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try { await fetch(`${API_BASE}/api/bootstrap`).then(r=>r.json()) } catch {}
      const s = await fetch(`${API_BASE}/api/stories`).then(r=>r.json()).catch(()=>[])
      const f = await fetch(`${API_BASE}/api/feed`).then(r=>r.json()).catch(()=>[])
      setStories(Array.isArray(s) ? s : [])
      setFeed(Array.isArray(f) ? f : [])
      setLoading(false)
    }
    load()
  }, [])

  const onLike = async (id) => {
    try { await fetch(`${API_BASE}/api/like/${id}`, { method: 'POST' }) } catch {}
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="h-64 w-full">
          <Spline scene="https://prod.spline.design/ezRAY9QD27kiJcur/scene.splinecode" style={{ width: '100%', height: '100%' }} />
        </div>
        <div className="mt-4 text-gray-500">Generating your AI social universe…</div>
      </div>
    )
  }

  return (
    <div>
      <Stories stories={stories} />
      <div>
        {feed.map(p => <PostCard key={p._id} post={p} onLike={onLike} />)}
      </div>
    </div>
  )
}

function ExploreGrid({ items }) {
  return (
    <div className="grid grid-cols-3 gap-0.5">
      {items.map((it, i) => (
        <img key={i} src={it.media_url} className="w-full aspect-square object-cover" />
      ))}
    </div>
  )
}

function Explore() {
  const [items, setItems] = useState([])
  useEffect(() => {
    const load = async () => {
      try { await fetch(`${API_BASE}/api/bootstrap`) } catch {}
      const f = await fetch(`${API_BASE}/api/feed?limit=30`).then(r=>r.json()).catch(()=>[])
      setItems(Array.isArray(f) ? f : [])
    }
    load()
  }, [])
  return <ExploreGrid items={items} />
}

function Profile() {
  const [me, setMe] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try { await fetch(`${API_BASE}/api/bootstrap`) } catch {}
      const data = await fetch(`${API_BASE}/api/me`).then(r=>r.json()).catch(()=>null)
      setMe(data)
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <div className="flex items-center justify-center h-[60vh] text-gray-500">Loading profile…</div>
  if (!me) return <div className="flex items-center justify-center h-[60vh] text-gray-500">Profile unavailable</div>

  const { user, posts, stats } = me

  return (
    <div>
      <div className="px-4 py-6">
        <div className="flex items-center gap-6">
          <img src={user?.avatar_url} className="w-20 h-20 rounded-full object-cover" />
          <div className="flex-1">
            <div className="text-lg font-semibold">{user?.username}</div>
            <div className="flex gap-6 mt-2 text-sm">
              <div><span className="font-semibold">{stats?.posts || 0}</span> posts</div>
              <div><span className="font-semibold">{stats?.followers || 0}</span> followers</div>
              <div><span className="font-semibold">{stats?.following || 0}</span> following</div>
            </div>
            {user?.bio && <div className="text-sm text-gray-600 mt-2">{user.bio}</div>}
          </div>
        </div>
        <div className="mt-4">
          <button className="px-4 py-2 border border-gray-300 rounded-md text-sm">Edit profile</button>
        </div>
      </div>
      <div className="border-t border-gray-200" />
      <div className="grid grid-cols-3 gap-0.5">
        {(posts || []).map((p) => (
          <img key={p._id} src={p.media_url} className="w-full aspect-square object-cover" />
        ))}
        {(!posts || posts.length === 0) && (
          <div className="col-span-3 py-16 text-center text-gray-500">No posts yet</div>
        )}
      </div>
    </div>
  )
}

function Placeholder({ title }) {
  return (
    <div className="flex items-center justify-center h-[60vh] text-gray-500">{title} coming soon</div>
  )
}

export default function App() {
  const [tab, setTab] = useState('home')

  return (
    <div className="min-h-screen bg-white text-black">
      <TopBar />
      <div className="max-w-3xl mx-auto pb-16">
        {tab === 'home' && <HomeFeed />}
        {tab === 'search' && <Explore />}
        {tab === 'reels' && <Placeholder title="Reels" />}
        {tab === 'shop' && <Placeholder title="Shop" />}
        {tab === 'profile' && <Profile />}
      </div>
      <BottomNav tab={tab} setTab={setTab} />
    </div>
  )
}
