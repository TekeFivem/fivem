import { useEffect, useState, type MouseEvent } from 'react'
import { fetchNui } from '../../lib/fetchNui'
import { LootCard } from '../LootCard/LootCard'
import { LootFields } from '../LootFields/LootFields'
import type { LootItem } from '../../lib/loot'
import styles from './CleanRevealModal.module.scss'

type Entry = { id: string; identified: false } | (LootItem & { identified: true })
interface BoxLootResp { items: Entry[]; identifySeconds: number }

interface Props {
    boxId: string
    onClose: () => void
    onChanged?: () => void
}

// dev mock
const MOCK: BoxLootResp = {
    identifySeconds: 4,
    items: [
        { id: 'b1', identified: false },
        { id: 'b2', identified: false },
        { id: 'b3', identified: false },
    ],
}

export const CleanRevealModal = ({ boxId, onClose, onChanged }: Props) => {
    const [items, setItems] = useState<Entry[]>([])
    const [seconds, setSeconds] = useState(4)
    const [busyId, setBusyId] = useState<string | null>(null)
    const [detailId, setDetailId] = useState<string | null>(null)
    const [menu, setMenu] = useState<{ x: number; y: number; id: string } | null>(null)

    useEffect(() => {
        fetchNui<BoxLootResp>('getBoxLoot', { id: boxId }, MOCK)
            .then((r) => { setItems(r.items || []); setSeconds(r.identifySeconds || 4) })
            .catch(() => { })
    }, [boxId])

    const identify = (id: string) => {
        if (busyId) return
        const e = items.find((x) => x.id === id)
        if (!e || e.identified) return
        setBusyId(id); setMenu(null)
        window.setTimeout(() => {
            fetchNui<{ ok: boolean; item?: LootItem }>('identifyLoot', { lid: id }, {
                ok: true,
                item: {
                    id, item: 'goldbar', name: 'Külçe Altın', count: 1, inspected: true,
                    image: 'nui://ox_inventory/web/images/goldbar.png',
                    levels: { value: 'high', clean: 'mid', repair: 'high', authentic: 'high', rarity: 'high', demand: 'high', legal: 'low' },
                },
            })
                .then((res) => {
                    setBusyId(null)
                    if (res?.ok && res.item) {
                        const li = res.item
                        setItems((prev) => prev.map((x) => (x.id === id ? { ...li, id, identified: true } : x)))
                    }
                })
                .catch(() => setBusyId(null))
        }, seconds * 1000)
    }

    const sendToLoot = (id: string) => {
        setMenu(null); setDetailId(null)
        fetchNui<{ ok: boolean }>('lootToTab', { lid: id }, { ok: true })
            .then((res) => { if (res?.ok) { setItems((prev) => prev.filter((x) => x.id !== id)); onChanged?.() } })
            .catch(() => { })
    }

    const trash = (id: string) => {
        setMenu(null); setDetailId(null)
        fetchNui<{ ok: boolean }>('lootTrash', { lid: id }, { ok: true })
            .then((res) => { if (res?.ok) setItems((prev) => prev.filter((x) => x.id !== id)) })
            .catch(() => { })
    }

    const openMenu = (ev: MouseEvent, id: string) => {
        ev.preventDefault()
        setMenu({ x: ev.clientX, y: ev.clientY, id })
    }

    const detail = items.find((x) => x.id === detailId && x.identified) as (LootItem & { identified: true }) | undefined
    const menuEntry = menu ? items.find((x) => x.id === menu.id) : undefined

    return (
        <div className={styles.backdrop} onClick={() => { setMenu(null); onClose() }}>
            <div className={styles.modal} onClick={(e) => { e.stopPropagation(); setMenu(null) }}>
                <header className={styles.head}>
                    <span className={styles.title}>TEMİZLİK — İTEMLERİ TANIMLA</span>
                    <button className={styles.close} onClick={onClose}>✕</button>
                </header>

                <p className={styles.hint}>
                    Blurlu itemlere <b>çift tık</b> ya da <b>sağ tık → Tanımla</b>. Tanımlanınca <b>tık</b> ile detay, <b>sağ tık</b> ile Loot'a Gönder / Çöpe At.
                </p>

                {items.length === 0 ? (
                    <div className={styles.empty}>Bu kutuda item kalmadı.</div>
                ) : (
                    <div className={styles.grid}>
                        {items.map((e) =>
                            e.identified ? (
                                <div key={e.id} className={styles.slot}
                                    onContextMenu={(ev) => openMenu(ev, e.id)}
                                    onDoubleClick={() => setDetailId(e.id)}>
                                    <LootCard item={e} onOpen={() => setDetailId(e.id)} />
                                </div>
                            ) : (
                                <div key={e.id}
                                    className={[styles.slot, styles.blurred, busyId === e.id ? styles.identifying : ''].join(' ')}
                                    onContextMenu={(ev) => openMenu(ev, e.id)}
                                    onDoubleClick={() => identify(e.id)}>
                                    <div className={styles.mystery}>?</div>
                                    {busyId === e.id && (
                                        <div className={styles.progress}>
                                            <span className={styles.bar} style={{ animationDuration: `${seconds}s` }} />
                                        </div>
                                    )}
                                </div>
                            ),
                        )}
                    </div>
                )}

                {menu && menuEntry && (
                    <div className={styles.menu} style={{ left: menu.x, top: menu.y }} onClick={(e) => e.stopPropagation()}>
                        {!menuEntry.identified ? (
                            <button onClick={() => identify(menu.id)}>🔍 Tanımla</button>
                        ) : (
                            <>
                                <button onClick={() => setDetailId(menu.id)}>📋 Detayı Gör</button>
                                <button onClick={() => sendToLoot(menu.id)}>📦 Loot'a Gönder</button>
                                <button className={styles.danger} onClick={() => trash(menu.id)}>🗑️ Çöpe At</button>
                            </>
                        )}
                    </div>
                )}

                {detail && (
                    <div className={styles.detailBackdrop} onClick={() => setDetailId(null)}>
                        <div className={styles.detail} onClick={(e) => e.stopPropagation()}>
                            <header className={styles.head}>
                                <span className={styles.title}>
                                    {detail.name}{detail.count && detail.count > 1 ? ` ×${detail.count}` : ''}
                                </span>
                                <button className={styles.close} onClick={() => setDetailId(null)}>✕</button>
                            </header>
                            <LootFields item={detail} />
                            <div className={styles.detailActions}>
                                <button className={styles.send} onClick={() => sendToLoot(detail.id)}>📦 Loot'a Gönder</button>
                                <button className={styles.danger} onClick={() => trash(detail.id)}>🗑️ Çöpe At</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}