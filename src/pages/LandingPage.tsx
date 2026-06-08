import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'
import { Button } from '../components/ui/Button'

export function LandingPage() {
  const { user } = useAuth()
  const { t } = useLanguage()

  return (
    <div className="py-4 sm:py-12">
      {/* Hero */}
      <section className="text-center max-w-3xl mx-auto animate-fade-in-up">
        <div className="inline-flex items-center gap-2 rounded-full bg-accent-light px-4 py-1.5 text-sm font-medium text-accent mb-6">
          <span className="inline-block w-2 h-2 rounded-full bg-accent animate-pulse-soft" />
          {t('landing.badge')}
        </div>

        <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl font-bold text-ink leading-[1.1] tracking-tight">
          {t('landing.hero.title1')}
          <br />
          <span className="gradient-text">{t('landing.hero.title2')}</span>
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-ink-muted leading-relaxed max-w-xl mx-auto">
          {t('landing.subtext')}
        </p>

        <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
          {user ? (
            <Link to="/home">
              <Button size="lg" className="shadow-lg shadow-accent/20 hover:shadow-xl hover:shadow-accent/30 transition-shadow">
                {t('landing.buttons.mySessions')}
              </Button>
            </Link>
          ) : (
            <>
              <Link to="/signup">
                <Button size="lg" className="shadow-lg shadow-accent/20 hover:shadow-xl hover:shadow-accent/30 transition-shadow">
                  {t('landing.buttons.createAccount')}
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="secondary" size="lg">
                  {t('landing.buttons.signIn')}
                </Button>
              </Link>
            </>
          )}
        </div>
      </section>

      {/* Stats banner */}
      <section className="mt-16 sm:mt-20 animate-fade-in-up stagger-2">
        <div className="rounded-3xl bg-gradient-to-r from-sage/5 via-accent/5 to-sage/5 border border-border/60 px-6 py-8">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl sm:text-3xl font-bold font-serif text-accent">{t('landing.stats.maxReaders')}</p>
              <p className="text-xs sm:text-sm text-ink-muted mt-1">{t('landing.stats.maxReadersLabel')}</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-bold font-serif text-sage">{t('landing.stats.unlimited')}</p>
              <p className="text-xs sm:text-sm text-ink-muted mt-1">{t('landing.stats.unlimitedLabel')}</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-bold font-serif text-ink">{t('landing.stats.free')}</p>
              <p className="text-xs sm:text-sm text-ink-muted mt-1">{t('landing.stats.freeLabel')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mt-16 sm:mt-24">
        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-center mb-3 animate-fade-in-up stagger-2">
          {t('landing.features.title')}
        </h2>
        <p className="text-ink-muted text-center mb-10 max-w-lg mx-auto animate-fade-in-up stagger-3">
          {t('landing.features.subtitle')}
        </p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feature, i) => (
            <div
              key={feature.key}
              className={`group rounded-2xl border border-border bg-card p-6 card-hover animate-fade-in-up stagger-${Math.min(i + 1, 5)}`}
            >
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${feature.bgColor} text-2xl mb-4 group-hover:scale-110 transition-transform`}>
                {feature.icon}
              </div>
              <h3 className="font-serif text-lg font-semibold">{t(`landing.features.items.${feature.key}.title`)}</h3>
              <p className="text-sm text-ink-muted mt-2 leading-relaxed">{t(`landing.features.items.${feature.key}.desc`)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="mt-16 sm:mt-24">
        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-center mb-12 animate-fade-in-up">
          {t('landing.steps.title')}
        </h2>

        <div className="grid sm:grid-cols-3 gap-8 max-w-3xl mx-auto">
          {steps.map((step, i) => (
            <div key={step.key} className={`text-center animate-fade-in-up stagger-${i + 1}`}>
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-full gradient-accent text-white font-bold text-sm mb-4">
                {i + 1}
              </div>
              <h3 className="font-serif font-semibold">{t(`landing.steps.items.${step.key}.title`)}</h3>
              <p className="text-sm text-ink-muted mt-2">{t(`landing.steps.items.${step.key}.desc`)}</p>
            </div>
          ))}
        </div>

        {!user && (
          <div className="text-center mt-12 animate-fade-in-up stagger-4">
            <Link to="/signup">
              <Button size="lg" className="shadow-lg shadow-accent/20">
                {t('landing.buttons.startFree')}
              </Button>
            </Link>
          </div>
        )}
      </section>

      {/* Testimonial / quote */}
      <section className="mt-16 sm:mt-24 mb-8 animate-fade-in-up stagger-5">
        <div className="rounded-3xl gradient-sage p-8 sm:p-12 text-center text-white">
          <span className="text-4xl mb-4 block opacity-80">📖</span>
          <blockquote className="font-serif text-xl sm:text-2xl leading-relaxed max-w-2xl mx-auto italic opacity-95">
            {t('landing.quote.body')}
          </blockquote>
          <p className="mt-4 text-sm opacity-75 font-medium">{t('landing.quote.author')}</p>
        </div>
      </section>
    </div>
  )
}

const features = [
  {
    icon: '✨',
    key: 'create',
    bgColor: 'bg-gold-light',
  },
  {
    icon: '🔗',
    key: 'share',
    bgColor: 'bg-accent-light',
  },
  {
    icon: '📊',
    key: 'track',
    bgColor: 'bg-sage-light',
  },
  {
    icon: '💬',
    key: 'discuss',
    bgColor: 'bg-rose-light',
  },
  {
    icon: '😊',
    key: 'react',
    bgColor: 'bg-gold-light',
  },
  {
    icon: '👥',
    key: 'limit',
    bgColor: 'bg-accent-light',
  },
]

const steps = [
  {
    key: 'create',
  },
  {
    key: 'share',
  },
  {
    key: 'read',
  },
]
